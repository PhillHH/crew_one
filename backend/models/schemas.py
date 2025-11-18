from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
import re


class ExperienceLevel(str, Enum):
    """User experience level for DIY projects."""
    BEGINNER = "beginner"
    EXPERIENCED = "experienced"
    PROFESSIONAL = "professional"


class DeliveryOptions(BaseModel):
    """Options for PDF delivery."""
    download: bool = Field(default=True, description="Offer direct download")
    email: bool = Field(default=False, description="Send via email")
    
    @validator('*')
    def at_least_one_selected(cls, v, values):
        """Ensure at least one delivery option is selected."""
        if not any(values.values()) and not v:
            raise ValueError("At least one delivery option must be selected")
        return v


class SupportOptions(BaseModel):
    """Optional support services."""
    phone_support: bool = Field(default=False, description="Telephone support during project")
    onsite_support: bool = Field(default=False, description="On-site support (Hamburg only)")
    location: Optional[str] = Field(None, description="User location for on-site support")
    
    @validator('location')
    def validate_location_for_onsite(cls, v, values):
        """Require location if on-site support is requested."""
        if values.get('onsite_support') and not v:
            raise ValueError("Location is required for on-site support")
        return v


class ContactInfo(BaseModel):
    """User contact information."""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number (German format)")
    
    @validator('phone')
    def validate_german_phone(cls, v):
        """Validate German phone number format."""
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        
        # Check for valid German phone patterns
        patterns = [
            r'^\+49\d{9,13}$',  # +49...
            r'^0049\d{9,13}$',  # 0049...
            r'^0\d{9,12}$',     # 0...
        ]
        
        if not any(re.match(pattern, cleaned) for pattern in patterns):
            raise ValueError(
                "Invalid German phone number. "
                "Use format: +49... or 0..."
            )
        
        return v


class DIYRequest(BaseModel):
    """Complete DIY project request."""
    project_description: str = Field(
        ...,
        min_length=20,
        max_length=2000,
        description="Detailed description of the DIY project"
    )
    experience_level: ExperienceLevel = Field(
        ...,
        description="User's experience level with DIY projects"
    )
    delivery_options: DeliveryOptions = Field(
        ...,
        description="How to deliver the PDF"
    )
    support_options: Optional[SupportOptions] = Field(
        default=None,
        description="Optional support services"
    )
    contact: ContactInfo = Field(
        ...,
        description="User contact information"
    )


class DIYResponse(BaseModel):
    """Response after generating DIY report."""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Human-readable status message")
    pdf_url: Optional[str] = Field(None, description="URL to download the PDF")
    file_id: Optional[str] = Field(None, description="Unique file identifier")
    support_request_id: Optional[str] = Field(
        None,
        description="Support request ID if support was requested"
    )
    email_sent: bool = Field(default=False, description="Whether email was sent")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "PDF wurde erfolgreich erstellt",
                "pdf_url": "/api/download/abc123",
                "file_id": "abc123",
                "support_request_id": "SR-12345",
                "email_sent": True
            }
        }

