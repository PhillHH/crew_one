import asyncio
import json
import logging
from dataclasses import dataclass
from typing import List, Optional

from openai import AsyncOpenAI, OpenAIError

from backend.config import settings
from backend.models.intake import IntakeChatRequest

logger = logging.getLogger(__name__)


def build_system_prompt() -> str:
    # This prompt is designed to be conversational and focused on generating a project description.
    return """
Du bist **ALVA**, eine freundliche und hilfsbereite Assistentin für DIY-Projekte.
Deine Aufgabe ist es, Nutzern dabei zu helfen, ihre Projektideen in Worte zu fassen.
Du sollst eine detaillierte, gut formulierte Projektbeschreibung erstellen.

**Dein Verhalten:**
- **Menschlich und natürlich:** Sprich wie ein echter Mensch, nicht wie ein Roboter. Sei empathisch, geduldig und motivierend.
- **Offene Fragen:** Stelle offene Fragen, um den Nutzer zum Erzählen zu animieren. Vermeide geschlossene Ja/Nein-Fragen, es sei denn, es ist zur Klärung notwendig.
- **Kein Formular-Stil:** Fülle kein Formular aus. Das Gespräch soll fließen. Frage nicht nach Maßen, Budget oder Erfahrung, es sei denn, der Nutzer erwähnt es von sich aus.
- **Fokus auf das "Was" und "Warum":** Konzentriere dich darauf, was der Nutzer bauen oder gestalten möchte und warum. Was ist das Ziel des Projekts? Welche Atmosphäre soll geschaffen werden?
- **Zusammenfassen und vorschlagen:** Fasse regelmäßig zusammen, was du verstanden hast, und mache Vorschläge, wie man es formulieren könnte.
- **Abschluss:** Wenn du glaubst, eine gute Beschreibung zu haben, schlage sie dem Nutzer vor. Frage, ob sie passt oder ob noch etwas geändert werden soll. Wenn der Nutzer zufrieden ist, signalisiere den Abschluss des Gesprächs.

**Dein Output:**
- Am Ende des Gesprächs soll eine zusammenhängende Projektbeschreibung stehen.
- Du musst IMMER ein JSON-Objekt zurückgeben.

**Beispiel für ein gutes Gespräch:**
- Nutzer: "Ich will was für meinen Balkon."
- Du: "Oh, super! Ein Balkon-Projekt. Was schwebt dir denn so vor? Möchtest du es gemütlicher machen, etwas anpflanzen oder vielleicht einen kleinen Essbereich schaffen?"
- Nutzer: "Eher so eine gemütliche Ecke zum Lesen."
- Du: "Das klingt herrlich. Wie sieht dein Balkon denn jetzt aus? Gibt es schon Möbel oder ist er noch ganz leer? Das hilft mir, mir ein besseres Bild zu machen."

**Output-Format (strikt JSON):**
{
  "assistant_reply": "Dein Text für den Chat.",
  "is_complete": false
}

Wenn du eine finale Beschreibung vorschlägst und der Nutzer zustimmt, setze `is_complete` auf `true`.
Die `assistant_reply` sollte dann die finale, vollständige Projektbeschreibung enthalten.
"""


def build_messages(payload: IntakeChatRequest) -> List[dict]:
    messages = [
        {"role": "system", "content": build_system_prompt()},
        *({"role": turn.role, "content": turn.content} for turn in payload.history),
    ]
    return messages


def parse_agent_json(raw: str) -> dict:
    """Parse agent output, tolerating minor formatting issues."""
    text = raw.strip()
    if text.startswith("```") and text.endswith("```"):
        text = text[3:-3].strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Agent returned non-JSON text; wrapping it. preview=%r", text[:200])
        return {"assistant_reply": text, "is_complete": False}


@dataclass
class IntakeAgentResult:
    """Container for assistant output."""
    reply_text: str
    is_complete: bool


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
        if self._client is None:
            raise RuntimeError(
                "OPENAI_API_KEY ist nicht gesetzt. Bitte in .env eintragen."
            )

        messages = build_messages(payload)
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                temperature=0.6,
                messages=messages,
                max_tokens=512,
                response_format={"type": "json_object"},
            )
        except OpenAIError as exc:
            logger.exception("OpenAI intake call failed")
            raise RuntimeError(f"OpenAI-Fehler: {exc}") from exc

        raw_content = response.choices[0].message.content or ""
        if not raw_content.strip():
            raise RuntimeError("Der Intake-Agent hat eine leere Antwort geliefert.")

        data = parse_agent_json(raw_content)
        reply_text = data.get("assistant_reply", "").strip()
        is_complete = bool(data.get("is_complete", False))

        if not reply_text:
            logger.warning("Kein `assistant_reply` im JSON gefunden. Fallback.")
            reply_text = raw_content

        return IntakeAgentResult(reply_text=reply_text, is_complete=is_complete)

    async def stream_tokens(self, text: str):
        """Yield pseudo tokens to simulate streaming."""
        for token in text.split(" "):
            yield token + " "
            await asyncio.sleep(0.02)


intake_service = IntakeService()


