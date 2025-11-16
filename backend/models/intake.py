from __future__ import annotations

import logging
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, ValidationError

from backend.models.schemas import (
    ContactInfo,
    DeliveryOptions,
    DIYRequest,
    DIYResponse,
    ExperienceLevel,
    SupportOptions,
)

REQUIRED_TEXT_FIELDS = [
    "project_goal",
    "dimensions",
    "materials",
    "environment",
    "indoor_outdoor",
    "tools_available",
]
REQUIRED_CONTACT_FIELDS = ["contact_name", "contact_email", "contact_phone"]
REQUIRED_DELIVERY_FIELDS = ["delivery_download", "delivery_email"]


class IntakeTurn(BaseModel):
    """Represents a single conversational turn in the intake chat."""

    role: Literal["user", "assistant"]
    content: str


class DIYRequirementDraft(BaseModel):
    """Mutable requirement snapshot shared between client and agent."""

    project_goal: Optional[str] = None
    current_state: Optional[str] = None
    dimensions: Optional[str] = None
    surface_details: Optional[str] = None
    materials: Optional[List[str]] = None
    finish_preference: Optional[str] = None
    environment: Optional[str] = None
    indoor_outdoor: Optional[str] = None
    style_reference: Optional[str] = None
    tools_available: Optional[List[str]] = None
    skill_level: Optional[ExperienceLevel] = None
    experience_notes: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    special_considerations: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    delivery_download: Optional[bool] = None
    delivery_email: Optional[bool] = None
    support_phone: Optional[bool] = None
    support_onsite: Optional[bool] = None
    support_location: Optional[str] = None

    def update_from_dict(self, payload: Dict) -> "DIYRequirementDraft":
        """Merge incoming dict into draft."""
        cleaned = payload or {}
        for key, value in cleaned.items():
            if value in ("", None):
                continue
            if key in {"materials", "tools_available"} and isinstance(value, str):
                value = [item.strip() for item in value.split(",") if item.strip()]
            try:
                setattr(self, key, value)
            except ValidationError as exc:
                logging.getLogger(__name__).debug(
                    "Skipping invalid draft update",
                    extra={"field": key, "value": value, "error": str(exc)},
                )
                continue
        return self

    def missing_fields(self) -> List[str]:
        """Return list of fields still missing for a complete requirement."""
        missing: List[str] = []

        for field_name in REQUIRED_TEXT_FIELDS:
            value = getattr(self, field_name)
            if value is None or (isinstance(value, list) and not value):
                missing.append(field_name)

        if not self.skill_level:
            missing.append("skill_level")

        for field_name in REQUIRED_CONTACT_FIELDS:
            if getattr(self, field_name) in (None, ""):
                missing.append(field_name)

        if not (
            (self.delivery_download is True)
            or (self.delivery_email is True)
        ):
            missing.append("delivery_options")

        if self.support_onsite and not self.support_location:
            missing.append("support_location")

        return missing

    def build_description(self) -> str:
        """Compose a narrative description string."""
        parts: List[str] = []
        if self.project_goal:
            parts.append(f"Projektziel: {self.project_goal}")
        if self.current_state:
            parts.append(f"Ausgangslage: {self.current_state}")
        if self.dimensions:
            parts.append(f"Maße/Fläche: {self.dimensions}")
        if self.surface_details:
            parts.append(f"Oberfläche / Untergrund: {self.surface_details}")
        if self.environment or self.indoor_outdoor:
            env = self.environment or ""
            io = self.indoor_outdoor or ""
            parts.append(f"Einsatzort: {env} {io}".strip())
        if self.materials:
            parts.append(f"Material-/Stilwunsch: {', '.join(self.materials)}")
        if self.finish_preference:
            parts.append(f"Finish / Look: {self.finish_preference}")
        if self.style_reference:
            parts.append(f"Referenzstil: {self.style_reference}")
        if self.tools_available:
            parts.append(f"Vorhandene Werkzeuge: {', '.join(self.tools_available)}")
        if self.skill_level:
            parts.append(f"Erfahrungsniveau: {self.skill_level.value}")
        if self.experience_notes:
            parts.append(f"Zusatz zu Erfahrung: {self.experience_notes}")
        if self.budget:
            parts.append(f"Budgetrahmen: {self.budget}")
        if self.timeline:
            parts.append(f"Zeitplan: {self.timeline}")
        if self.special_considerations:
            parts.append(f"Besondere Hinweise: {self.special_considerations}")

        return "\n".join(parts).strip()

    def to_requirement(self) -> "DIYRequirement":
        """Convert draft into validated requirement."""
        missing = self.missing_fields()
        if missing:
            raise ValueError(f"Missing fields: {', '.join(missing)}")

        support_options: Optional[SupportOptions] = None
        if self.support_phone or self.support_onsite:
            support_options = SupportOptions(
                phone_support=bool(self.support_phone),
                onsite_support=bool(self.support_onsite),
                location=self.support_location,
            )

        requirement = DIYRequirement(
            project_goal=self.project_goal or "",
            current_state=self.current_state,
            dimensions=self.dimensions or "",
            surface_details=self.surface_details,
            materials=self.materials or [],
            finish_preference=self.finish_preference,
            environment=self.environment or "",
            indoor_outdoor=self.indoor_outdoor or "indoor",
            style_reference=self.style_reference,
            tools_available=self.tools_available or [],
            skill_level=self.skill_level or ExperienceLevel.BEGINNER,
            experience_notes=self.experience_notes,
            budget=self.budget,
            timeline=self.timeline,
            special_considerations=self.special_considerations,
            contact=ContactInfo(
                name=self.contact_name or "",
                email=self.contact_email or "missing@example.com",
                phone=self.contact_phone or "+49000000000",
            ),
            delivery_options=DeliveryOptions(
                download=bool(self.delivery_download or not self.delivery_email),
                email=bool(self.delivery_email),
            ),
            support_options=support_options,
        )
        return requirement


class DIYRequirement(BaseModel):
    """Validated DIY requirement passed to CrewAI."""

    project_goal: str
    current_state: Optional[str] = None
    dimensions: str
    surface_details: Optional[str] = None
    materials: List[str]
    finish_preference: Optional[str] = None
    environment: str
    indoor_outdoor: str
    style_reference: Optional[str] = None
    tools_available: List[str]
    skill_level: ExperienceLevel
    experience_notes: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    special_considerations: Optional[str] = None
    contact: ContactInfo
    delivery_options: DeliveryOptions
    support_options: Optional[SupportOptions] = None

    def to_project_description(self) -> str:
        """Generate a description suitable for DIYRequest."""
        lines = [
            f"Projektziel: {self.project_goal}",
            f"Maße/Fläche: {self.dimensions}",
            f"Einsatzort: {self.environment} ({self.indoor_outdoor})",
            f"Materialwunsch: {', '.join(self.materials)}",
            f"Vorhandene Werkzeuge: {', '.join(self.tools_available)}",
            f"Erfahrungslevel: {self.skill_level.value}",
        ]
        if self.current_state:
            lines.append(f"Ausgangslage: {self.current_state}")
        if self.surface_details:
            lines.append(f"Oberfläche/Untergrund: {self.surface_details}")
        if self.finish_preference:
            lines.append(f"Finish/Lack: {self.finish_preference}")
        if self.style_reference:
            lines.append(f"Stilreferenz: {self.style_reference}")
        if self.experience_notes:
            lines.append(f"Zusatz zur Erfahrung: {self.experience_notes}")
        if self.budget:
            lines.append(f"Budgetrahmen: {self.budget}")
        if self.timeline:
            lines.append(f"Zeitplan: {self.timeline}")
        if self.special_considerations:
            lines.append(f"Besondere Hinweise: {self.special_considerations}")
        return "\n".join(lines)

    def to_diy_request(self) -> DIYRequest:
        """Convert requirement into the legacy DIYRequest model."""
        return DIYRequest(
            project_description=self.to_project_description(),
            experience_level=self.skill_level,
            delivery_options=self.delivery_options,
            support_options=self.support_options,
            contact=self.contact,
        )


class IntakeChatRequest(BaseModel):
    """Payload for chat streaming endpoint."""

    history: List[IntakeTurn] = Field(..., description="Full conversation history")
    requirement_snapshot: Optional[DIYRequirementDraft] = Field(
        default=None,
        description="Latest requirement info known by the client",
    )


class IntakeChatUpdate(BaseModel):
    """Server updates streamed to the client."""

    type: Literal["message", "draft", "status", "error"]
    delta: Optional[str] = None
    draft: Optional[DIYRequirementDraft] = None
    is_complete: Optional[bool] = None
    missing_fields: Optional[List[str]] = None
    requirement: Optional[DIYRequirement] = None
    message: Optional[str] = None
    detail: Optional[str] = None


class IntakeFinalizeRequest(BaseModel):
    """Validate the final requirement and trigger crew workflow."""

    requirement: DIYRequirementDraft


class IntakeFinalizeResponse(BaseModel):
    """Return validated requirement plus crew workflow status."""

    requirement: DIYRequirement
    result: DIYResponse


