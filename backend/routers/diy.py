from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import logging

from backend.models.schemas import DIYRequest, DIYResponse
from backend.services import generate_diy_report, send_pdf_email, create_support_request
from backend.database import get_db
from backend.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["DIY"])


@router.post("/generate", response_model=DIYResponse)
async def generate_diy_pdf(
    request: DIYRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate a DIY PDF report based on user input.
    
    - Validates input
    - Calls CrewAI to generate report
    - Optionally sends email
    - Optionally creates support request
    """
    try:
        logger.info(
            "Received DIY request",
            extra={
                "email": request.contact.email,
                "experience_level": request.experience_level.value,
                "delivery": request.delivery_options.model_dump(),
                "support": request.support_options.model_dump() if request.support_options else None,
            }
        )
        
        # Generate PDF via CrewAI
        pdf_path, file_id = await generate_diy_report(
            project_description=request.project_description,
            experience_level=request.experience_level.value
        )
        
        # Prepare response
        response = DIYResponse(
            success=True,
            message="PDF wurde erfolgreich erstellt",
            pdf_url=f"/api/download/{file_id}" if request.delivery_options.download else None,
            file_id=file_id,
            email_sent=False
        )
        
        # Send email if requested
        if request.delivery_options.email:
            try:
                # Send email in background to not block response
                background_tasks.add_task(
                    send_pdf_email,
                    recipient_email=request.contact.email,
                    recipient_name=request.contact.name,
                    pdf_path=pdf_path,
                    project_description=request.project_description
                )
                response.email_sent = True
                response.message += " und wird per E-Mail zugesendet"
            except Exception as e:
                logger.error(f"Error scheduling email: {e}")
                # Don't fail the request if email fails
        
        # Create support request if requested
        if request.support_options and (
            request.support_options.phone_support or 
            request.support_options.onsite_support
        ):
            try:
                support_id = await create_support_request(
                    db=db,
                    contact=request.contact,
                    project_description=request.project_description,
                    experience_level=request.experience_level.value,
                    support_options=request.support_options
                )
                response.support_request_id = support_id
                response.message += f". Support-Anfrage {support_id} wurde erstellt"
            except Exception as e:
                logger.error(f"Error creating support request: {e}")
                # Don't fail the request if support creation fails
        
        logger.info(
            "DIY request processed successfully",
            extra={
                "email": request.contact.email,
                "file_id": file_id,
                "email_sent": response.email_sent,
                "support_request_id": getattr(response, "support_request_id", None),
            }
        )
        return response
        
    except Exception as e:
        logger.exception("Error generating DIY PDF")
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen der Anleitung: {str(e)}"
        )


@router.get("/download/{file_id}")
async def download_pdf(file_id: str):
    """
    Download generated PDF by file ID.
    
    Security: File IDs are random UUIDs, making them hard to guess.
    For production, consider implementing:
    - Time-limited tokens
    - One-time download links
    - User authentication
    """
    try:
        pdf_path = Path(settings.downloads_dir) / f"{file_id}.pdf"
        
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail="PDF nicht gefunden")
        
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"diy_anleitung_{file_id}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail="Fehler beim Herunterladen der PDF"
        )


@router.post("/support")
async def create_support_only(
    contact: dict,
    project_description: str,
    support_options: dict,
    db: Session = Depends(get_db)
):
    """
    Create a support request without generating a PDF.
    
    Useful for users who already have the PDF but need support.
    """
    try:
        from backend.models.schemas import ContactInfo, SupportOptions
        
        contact_info = ContactInfo(**contact)
        support_opts = SupportOptions(**support_options)
        
        support_id = await create_support_request(
            db=db,
            contact=contact_info,
            project_description=project_description,
            experience_level="unknown",
            support_options=support_opts
        )
        
        return {
            "success": True,
            "support_request_id": support_id,
            "message": f"Support-Anfrage {support_id} wurde erstellt"
        }
        
    except Exception as e:
        logger.error(f"Error creating support request: {e}")
        raise HTTPException(
            status_code=500,
            detail="Fehler beim Erstellen der Support-Anfrage"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "DIY CrewAI Backend",
        "version": settings.app_version
    }

