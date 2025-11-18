from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class IntakeTurn(BaseModel):
    """Represents a single conversational turn in the intake chat."""

    role: Literal["user", "assistant"]
    content: str


class IntakeChatRequest(BaseModel):
    """Payload for chat streaming endpoint."""

    history: List[IntakeTurn] = Field(..., description="Full conversation history")


class IntakeChatUpdate(BaseModel):
    """Server updates streamed to the client."""

    type: Literal["message", "status", "error"]
    delta: Optional[str] = None
    is_complete: Optional[bool] = None
    detail: Optional[str] = None


