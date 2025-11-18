# Backend (FastAPI)

Backend-Handbuch für API, Intake-Agent und CrewAI-Anbindung.

---

## 1. Stack & Voraussetzungen

- Python 3.11  
- `pip install -r requirements.txt` (plain Requirements, kein Poetry)  
- PostgreSQL (über `docker compose` verfügbar)  
- Zugriff auf `../diy` (CrewAI-Paket)  
- OpenAI-Key für den Intake-Agenten

---

## 2. Starten & Befehle

```bash
# Lokal (mit Hot Reload)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Docker
docker compose up backend    # startet backend + abhängige Dienste
```

Backend lauscht standardmäßig auf `http://localhost:8000` und akzeptiert Anfragen vom Frontend (`VITE_API_URL`).  

---

## 3. Kernmodule & Verantwortlichkeiten

| Datei / Verzeichnis | Zweck |
| --- | --- |
| `main.py` | FastAPI-App, Lifespan-Hooks (DB-Init, Logging, CORS). |
| `routers/diy.py` | Klassische Formular-Pipeline (`/api/generate`, `/api/download/{file_id}`, `/api/health`). |
| `routers/intake.py` | Intake-Agent via SSE (`/intake/chat/stream`) + Finalisierung (`/intake/finalize`). |
| `services/intake_service.py` | OpenAI-Client, Prompt, Draft-Verwaltung, JSON-Parsing mit Fallbacks. |
| `services/crewai_service.py` | Übergibt Requests an `diy/`, wartet auf PDFs, liefert `file_id`. |
| `services/email_service.py` / `support_service.py` | E-Mail-Versand und Support-Request-Persistenz. |
| `models/schemas.py` & `models/intake.py` | Pydantic-Schemas für Formular + Intake. |

---

## 4. Environment-Variablen

| Variable | Beschreibung | Pflicht |
| --- | --- | --- |
| `DATABASE_URL` | Postgres-URL | ✅ |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` | Mailversand (Success-Flow) | optional |
| `OPENAI_API_KEY` | Intake-Agent (Chat + Finalize) | ✅ für Intake |
| `OPENAI_MODEL` | Default `gpt-4o-mini` | optional |
| `CREWAI_WORKING_DIR` | Pfad zu `diy/` (Container: `/app/diy`) | ✅ |
| `OUTPUTS_DIR`, `DOWNLOADS_DIR` | Artefakt-Ablage | Default vorhanden |

`.env.example` enthält Beispielwerte; über `docker compose` werden die Variablen automatisch injiziert.

---

## 5. API-Überblick

| Endpoint | Beschreibung |
| --- | --- |
| `POST /api/generate` | Klassischer Formular-Flow → CrewAI → PDF/Support/E-Mail. |
| `GET /api/download/{file_id}` | Blob-Download, wird vom Frontend über `fetch` geladen. |
| `GET /api/health` | Healthcheck (genutzt von Frontend & Compose). |
| `POST /intake/chat/stream` | Server-Sent-Events für den Intake-Chat (Tokens, Draft, Status). |
| `POST /intake/finalize` | Validiert `DIYRequirementDraft`, erzeugt PDF + Support + Mails. |

**Intake-Streaming:** Das Backend liefert SSE-Chunks mit Typen `message`, `draft`, `status`, `error`. Fehlende oder fehlerhafte JSON-Antworten der OpenAI-API werden protokolliert und via Fallback abgefedert (`parse_agent_json`).  

---

## 6. CrewAI-Integration

```python
# backend/services/crewai_service.py (Auszug)
process = await asyncio.create_subprocess_exec(
    "python", "-c", python_code, json.dumps(payload),
    cwd=str(crewai_dir), stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE,
)
latest_pdf = max(outputs_dir.glob("*.pdf"), key=lambda p: p.stat().st_mtime)
return latest_pdf, file_id
```

- Läuft synchron; für lange Jobs ist eine Task-Queue (Celery, Dramatiq) vorgesehen.  
- PDFs landen sowohl im gemeinsamen Volume `diy/outputs/` als auch als Kopie (`downloads_dir`).  
- Download-Endpunkt liefert die Dateien unter einem neutralen Namen aus (`diy_anleitung_<file_id>.pdf`).

---

## 7. Datenbank & Support

- Aktuell nur Tabelle `support_requests`. geschrieben via `create_support_request()` (SQLAlchemy).  
- Migrations-Tool steht noch aus → Änderungen bitte dokumentieren und SQL-Skripte beilegen.  
- Zugriff im Container: `docker exec -it diy_db psql -U diy_user -d diy`.

---

## 8. Monitoring & Debugging

```bash
curl http://localhost:8000/api/health          # Healthcheck
docker compose logs backend                    # API-Logs (inkl. Intake)
docker compose logs crewai                     # CrewAI/PDF-Erstellung
docker compose logs frontend                   # Proxy/HMR
```

- Intake-spezifische Fehler loggen sowohl den Roh-Response als auch einen freundlichen Fehler für das Frontend.  
- PDF-Probleme tauchen im `crewai`-Service auf (WeasyPrint-Logs).  
- SMTP/Support-IDs werden im `backend`-Log (`DIY request processed successfully`) ausgegeben.

---

## 9. Tests, Qualität & Roadmap

| Thema | Status | To-dos |
| --- | --- | --- |
| Unit-/Integrationstests | rudimentär | FastAPI-TestClient für `/api/generate`, Mock von CrewAI/OpenAI |
| Intake-Robustheit | JSON-Fallback vorhanden | weitere Guards (max Tokens, Rate Limits) |
| Hintergrundjobs | nicht vorhanden | Worker/Queue für lange PDF-Läufe |
| Observability | Logging vorhanden | OpenTelemetry/Tracing in Planung |

Weitere Architekturhinweise: [`docs/README_FULLSTACK.md`](../docs/README_FULLSTACK.md).  
CrewAI-/PDF-Details: [`diy/PDF_GENERATION_GUIDE.md`](../diy/PDF_GENERATION_GUIDE.md).

