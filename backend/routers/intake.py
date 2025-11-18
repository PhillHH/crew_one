import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.models.intake import IntakeChatRequest
from backend.services import intake_service

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

        yield _sse({"type": "status", "is_complete": result.is_complete})
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )

