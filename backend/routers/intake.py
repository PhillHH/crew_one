import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.intake import (
    IntakeChatRequest,
    IntakeFinalizeRequest,
    IntakeFinalizeResponse,
)
from backend.models.schemas import DIYResponse
from backend.services import (
    create_support_request,
    generate_diy_report,
    intake_service,
    send_pdf_email,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/intake", tags=["Intake"])


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/chat/stream")
async def chat_stream(payload: IntakeChatRequest) -> StreamingResponse:
    """Proxy conversation with the intake agent via SSE."""

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            result = await intake_service.run_turn(payload)
        except Exception as exc:
            logger.exception("Intake agent failed")
            yield _sse({"type": "error", "detail": str(exc)})
            return

        async for token in intake_service.stream_tokens(result.reply_text):
            yield _sse({"type": "message", "delta": token})

        yield _sse(
            {
                "type": "draft",
                "draft": result.draft.model_dump(exclude_none=True),
            }
        )

        status_payload = {
            "type": "status",
            "is_complete": result.is_complete,
            "missing_fields": result.missing_fields,
            "message": result.message,
        }
        if result.final_requirement:
            status_payload["requirement"] = result.final_requirement.model_dump()

        yield _sse(status_payload)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )


@router.post("/finalize", response_model=IntakeFinalizeResponse)
async def finalize_intake(
    payload: IntakeFinalizeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> IntakeFinalizeResponse:
    """Validate requirement, trigger CrewAI workflow, and echo response."""
    try:
        requirement = payload.requirement.to_requirement()
        diy_request = requirement.to_diy_request()

        pdf_path, file_id = await generate_diy_report(
            project_description=diy_request.project_description,
            experience_level=diy_request.experience_level.value,
        )

        response = DIYResponse(
            success=True,
            message="Intake abgeschlossen. PDF wurde erstellt.",
            pdf_url=f"/api/download/{file_id}"
            if diy_request.delivery_options.download
            else None,
            file_id=file_id,
            email_sent=False,
        )

        if diy_request.delivery_options.email:
            background_tasks.add_task(
                send_pdf_email,
                recipient_email=diy_request.contact.email,
                recipient_name=diy_request.contact.name,
                pdf_path=pdf_path,
                project_description=diy_request.project_description,
            )
            response.email_sent = True
            response.message += " Versand per E-Mail."

        if diy_request.support_options and (
            diy_request.support_options.phone_support
            or diy_request.support_options.onsite_support
        ):
            support_id = await create_support_request(
                db=db,
                contact=diy_request.contact,
                project_description=diy_request.project_description,
                experience_level=diy_request.experience_level.value,
                support_options=diy_request.support_options,
            )
            response.support_request_id = support_id
            response.message += f" Support-Anfrage {support_id} erstellt."

        return IntakeFinalizeResponse(requirement=requirement, result=response)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to finalize intake")
        raise HTTPException(
            status_code=500,
            detail=f"Intake konnte nicht abgeschlossen werden: {exc}",
        ) from exc

