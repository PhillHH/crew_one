from sqlalchemy.orm import Session
from datetime import datetime
import random
import string
import logging

from backend.database.models import SupportRequest
from backend.models.schemas import ContactInfo, SupportOptions

logger = logging.getLogger(__name__)


def generate_support_id() -> str:
    """Generate unique support request ID (e.g., SR-12345)."""
    random_part = ''.join(random.choices(string.digits, k=5))
    return f"SR-{random_part}"


async def create_support_request(
    db: Session,
    contact: ContactInfo,
    project_description: str,
    experience_level: str,
    support_options: SupportOptions
) -> str:
    """
    Creates a support request in the database.
    
    Args:
        db: Database session
        contact: User contact information
        project_description: Description of the DIY project
        experience_level: User's experience level
        support_options: Requested support options
    
    Returns:
        Support request ID (e.g., "SR-12345")
    
    Raises:
        Exception: If database operation fails
    """
    try:
        # Generate unique request ID
        request_id = generate_support_id()
        
        # Create support request
        support_request = SupportRequest(
            request_id=request_id,
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            project_description=project_description,
            experience_level=experience_level,
            phone_support=support_options.phone_support,
            onsite_support=support_options.onsite_support,
            location=support_options.location,
            status="pending"
        )
        
        db.add(support_request)
        db.commit()
        db.refresh(support_request)
        
        logger.info(f"Support request created: {request_id}")
        
        return request_id
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating support request: {e}")
        raise


async def get_support_request(
    db: Session,
    request_id: str
) -> SupportRequest:
    """Get support request by ID."""
    return db.query(SupportRequest).filter(
        SupportRequest.request_id == request_id
    ).first()


async def update_support_status(
    db: Session,
    request_id: str,
    status: str
) -> bool:
    """Update support request status."""
    try:
        support_request = await get_support_request(db, request_id)
        if not support_request:
            return False
        
        support_request.status = status
        support_request.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Support request {request_id} updated to {status}")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating support request: {e}")
        raise

