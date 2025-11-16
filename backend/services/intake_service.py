import asyncio
import json
import logging
from dataclasses import dataclass
from typing import List, Optional

from openai import AsyncOpenAI, OpenAIError

from backend.config import settings
from backend.models.intake import (
    DIYRequirement,
    DIYRequirementDraft,
    IntakeChatRequest,
)

logger = logging.getLogger(__name__)


def _format_dict(draft: DIYRequirementDraft) -> str:
    data = draft.model_dump(exclude_none=True)
    if not data:
        return "Noch keine Angaben vorhanden."
    lines = []
    for key, value in data.items():
        if isinstance(value, list):
            value = ", ".join(str(item) for item in value)
        lines.append(f"- {key}: {value}")
    return "\n".join(lines)


def _json_schema_description() -> str:
    return json.dumps(
        {
            "assistant_reply": "string (deutsch, freundlich, max. 3 Sätze)",
            "requirement_updates": {
                "project_goal": "string",
                "current_state": "string",
                "dimensions": "string",
                "surface_details": "string",
                "materials": ["Material A", "Material B"],
                "finish_preference": "string",
                "environment": "string",
                "indoor_outdoor": "indoor|outdoor|both",
                "style_reference": "string",
                "tools_available": ["Tool A", "Tool B"],
                "skill_level": "beginner|experienced|professional",
                "experience_notes": "string",
                "budget": "string",
                "timeline": "string",
                "special_considerations": "string",
                "contact_name": "string",
                "contact_email": "valid email",
                "contact_phone": "string",
                "delivery_download": True,
                "delivery_email": False,
                "support_phone": False,
                "support_onsite": False,
                "support_location": "string falls onsite true",
            },
            "is_complete": "boolean",
            "message": "kurze nächste Rückfrage oder Abschlussfrage",
            "requirements": {
                "project_goal": "string",
                "current_state": "string",
                "dimensions": "string",
                "surface_details": "string",
                "materials": ["..."],
                "finish_preference": "string",
                "environment": "string",
                "indoor_outdoor": "indoor|outdoor|both",
                "style_reference": "string",
                "tools_available": ["..."],
                "skill_level": "beginner|experienced|professional",
                "experience_notes": "string",
                "budget": "string",
                "timeline": "string",
                "special_considerations": "string",
                "contact_name": "string",
                "contact_email": "string",
                "contact_phone": "string",
                "delivery_download": True,
                "delivery_email": False,
                "support_phone": False,
                "support_onsite": False,
                "support_location": "string or null"
            },
        },
        ensure_ascii=False,
        indent=2,
    )


def _count_user_turns(payload: IntakeChatRequest) -> int:
    return sum(1 for turn in payload.history if turn.role == "user")


def build_system_prompt(draft: DIYRequirementDraft, user_turns: int) -> str:
    missing = draft.missing_fields()
    missing_text = (
        ", ".join(missing)
        if missing
        else "Alle Pflichtangaben vorhanden – bestätige dem Nutzer und leite zum Abschluss über."
    )
    remaining_before_proposal = max(0, 3 - user_turns)
    # This prompt keeps the intake assistant conversational while enforcing JSON outputs.
    return f"""
Du bist **ALVA**, eine empathische Baumarkt-Projektberaterin. Ziel: Aus einer Idee ein vollständiges DIYRequirement ableiten, das sofort an das CrewAI-Team übergeben werden kann.

Gesprächsstil:
- Sprich kurz, natürlich und motivierend – nie formell oder roboterhaft.
- Reagiere auf jede Antwort mit einer Mini-Zusammenfassung (1–2 Sätze), warum die Info hilft.
- Stelle höchstens **eine bis zwei** neue Rückfragen, die thematisch zusammenhängen.
- Keine Dopplungen: sobald ein Feld klar ist, nicht erneut erfragen.

Inhaltliche Reihenfolge (nur falls noch offen):
1. Projektziel + Ausgangslage
2. Maße/Flächen/Dimensionen
3. Oberfläche/Untergrund & gewünschtes Material/Look/Stil
4. Indoor/Outdoor & Umgebung
5. Verfügbare Werkzeuge/Ausstattung
6. Erfahrungslevel (`beginner|experienced|professional`) + kurze Zusatzinfo falls nötig
7. Budget, Zeitplan, besondere Hinweise
- Kontakt (Name, E-Mail, Telefon) und Lieferoptionen (Download/E-Mail). Support (Telefon/Onsite) nur, wenn ausdrücklich gewünscht.

Aktueller Fortschritt: Du hast bereits {user_turns} Nutzerantwort(en). 
- Spätestens **nach drei** Antworten musst du einen zusammengestellten Vorschlag liefern (Restliche Pflichtfelder gemeinsam einsammeln, auch wenn dir noch etwas fehlt). Verweise dabei auf die offenen Punkte.
- Nach dem Vorschlag sind maximal **zwei** kurze Nachschärfungs-Runden erlaubt; danach bitte höflich um finale Bestätigung.

Robustheit:
- Wenn eine Antwort unpräzise ist („weiß ich noch nicht“), hilf mit Beispielen weiter.
- Nutze Kontext: verweise auf bereits genannte Maße oder Wünsche.

Abschluss:
- Wenn **alle** Pflichtfelder vorhanden sind, stelle eine letzte Check-Frage („Habe ich alles richtig verstanden oder fehlt noch etwas?“). Warte auf Bestätigung.
- Erst danach liefere `{{"is_complete": true, "requirements": {{...}}}}`. Bis dahin ausschließlich `{{"is_complete": false, "message": "<nächste Frage>"}}`.
- **Wichtig:** Das JSON-Feld `message` muss immer gesetzt sein (entweder nächste Frage oder höfliche Abschlussfrage).

Aktueller Wissensstand:
{_format_dict(draft)}

Bisher fehlend: {missing_text}

OUTPUTFORMAT (strikt JSON):
{_json_schema_description()}
"""


def build_messages(payload: IntakeChatRequest, draft: DIYRequirementDraft) -> List[dict]:
    messages = [
        {
            "role": "system",
            "content": build_system_prompt(draft, _count_user_turns(payload)),
        }
    ]
    for turn in payload.history:
        messages.append({"role": turn.role, "content": turn.content})
    return messages


def parse_agent_json(raw: str) -> dict:
    """Parse agent output, tolerating minor formatting issues."""

    def _strip_markdown_fence(text: str) -> str:
        if not text.startswith("```"):
            return text
        trimmed = text[3:]
        if trimmed.lower().startswith("json"):
            trimmed = trimmed[4:]
        end_fence = trimmed.rfind("```")
        if end_fence != -1:
            trimmed = trimmed[:end_fence]
        return trimmed.strip()

    def _extract_json_segment(text: str) -> str:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        return text

    original = raw or ""
    attempts = []

    sanitized = original.strip()

    # Fallback: Modell hat reinen Fließtext ohne JSON geliefert.
    if sanitized and "{" not in sanitized and "}" not in sanitized:
        logger.warning(
            "Agent returned non-JSON text; using fallback wrapper. preview=%r",
            sanitized[:200],
        )
        return {
            "assistant_reply": sanitized,
            "requirement_updates": {},
            "is_complete": False,
            "message": sanitized,
        }

    if sanitized:
        attempts.append(sanitized)
        fenced = _strip_markdown_fence(sanitized)
        if fenced and fenced not in attempts:
            attempts.append(fenced)
        segment = _extract_json_segment(fenced)
        if segment and segment not in attempts:
            attempts.append(segment)

    for candidate in attempts:
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    text = original
    preview = text[:400]
    logger.error(
        "Failed to parse agent JSON. length=%d, whitespace_only=%s, preview=%r",
        len(text),
        text.strip() == "",
        preview,
    )
    raise ValueError("Antwort des Intake-Agenten konnte nicht interpretiert werden")


@dataclass
class IntakeAgentResult:
    """Container for assistant output."""

    reply_text: str
    draft: DIYRequirementDraft
    is_complete: bool
    missing_fields: List[str]
    message: str
    final_requirement: Optional[DIYRequirement]


class IntakeService:
    """Encapsulates OpenAI-based intake dialogue."""

    def __init__(self) -> None:
        api_key = settings.openai_api_key
        if not api_key:
            logger.warning("OPENAI_API_KEY is not configured – intake agent will fail")
            self._client: Optional[AsyncOpenAI] = None
        else:
            self._client = AsyncOpenAI(api_key=api_key)
        self._model = settings.openai_model or "gpt-4o-mini"

    async def run_turn(self, payload: IntakeChatRequest) -> IntakeAgentResult:
        draft = payload.requirement_snapshot or DIYRequirementDraft()
        messages = build_messages(payload, draft)

        if self._client is None:
            raise RuntimeError(
                "OPENAI_API_KEY ist nicht gesetzt. Bitte trage ihn in .env bzw. diy/.env ein."
            )

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                temperature=0.4,
                messages=messages,
                max_completion_tokens=512,
            )
        except OpenAIError as exc:
            logger.exception("OpenAI intake call failed")
            raise RuntimeError(f"OpenAI-Fehler: {exc}") from exc

        usage = getattr(response, "usage", None)
        if usage:
            logger.info(
                "Intake completion usage: prompt=%s, completion=%s, total=%s",
                getattr(usage, "prompt_tokens", None),
                getattr(usage, "completion_tokens", None),
                getattr(usage, "total_tokens", None),
            )

        message = response.choices[0].message
        raw_content = message.content or ""
        content = raw_content.strip()

        if not content:
            logger.error(
                "OpenAI response missing JSON content. raw=%r, response=%s",
                raw_content,
                response.model_dump(),
            )
            raise RuntimeError(
                "Der Intake-Agent hat keine auswertbare Antwort geliefert."
            )

        data = parse_agent_json(content)

        reply_text = data.get("assistant_reply", "").strip()
        requirement_updates = data.get("requirement_updates") or {}
        is_complete_flag = bool(data.get("is_complete"))
        next_message = (data.get("message") or reply_text or "").strip()

        draft.update_from_dict(requirement_updates)

        missing_fields = draft.missing_fields()
        is_complete = is_complete_flag and not missing_fields
        final_requirement: Optional[DIYRequirement] = None

        if is_complete:
            try:
                final_requirement = draft.to_requirement()
            except ValueError as exc:
                logger.warning("Requirement incomplete despite is_complete flag: %s", exc)
                is_complete = False
                missing_fields = draft.missing_fields()

        return IntakeAgentResult(
            reply_text=reply_text or "Alles klar.",
            draft=draft,
            is_complete=is_complete,
            missing_fields=missing_fields,
            message=next_message,
            final_requirement=final_requirement,
        )

    async def stream_tokens(self, text: str):
        """Yield pseudo tokens to simulate streaming."""
        for token in text.split(" "):
            yield token + " "
            await asyncio.sleep(0)


intake_service = IntakeService()


