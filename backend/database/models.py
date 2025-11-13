from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from .db import Base


class SupportRequest(Base):
    """Support request database model."""
    __tablename__ = "support_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Contact Information
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    
    # Project Details
    project_description = Column(Text, nullable=False)
    experience_level = Column(String(20), nullable=False)
    
    # Support Type
    phone_support = Column(Boolean, default=False)
    onsite_support = Column(Boolean, default=False)
    location = Column(String(100), nullable=True)
    
    # Status
    status = Column(
        String(20),
        default="pending",
        nullable=False
    )  # pending, in_progress, completed, cancelled
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    def __repr__(self):
        return f"<SupportRequest {self.request_id} - {self.name}>"

