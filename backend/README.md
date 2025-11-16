# Backend (FastAPI)

Dieses Dokument beschreibt Setup, Befehle und Besonderheiten des FastAPI-Backends.

## 1. Voraussetzungen

- Python 3.11
- Poetry/Pip (Projekt nutzt plain `requirements.txt`)
- Laufende PostgreSQL-Instanz (lokal per `docker compose`)
- Zugriff auf das CrewAI-Verzeichnis (`../diy`)

## 2. Installation & lokale Ausführung

```bash
pip install -r requirements.txt          # Dependencies
uvicorn main:app --reload --port 8000    # Dev-Server

# oder über docker compose
docker compose up backend
```

> **Hinweis:** Beim lokalen Start müssen die Env-Variablen (siehe unten) gesetzt sein – zumindest `DATABASE_URL` und die SMTP-Credentials, wenn E-Mails versendet werden sollen.

## 3. Wichtige Dateien

- `main.py` – erstellt FastAPI-App, bindet Router und initiiert DB.
- `routers/diy.py` – stellt `/api/generate`, `/api/download/{id}`, `/api/support`, `/api/health`.
- `services/crewai_service.py` – ruft CrewAI auf, wartet auf PDFs, liefert `file_id` zurück.
- `models/schemas.py` – `DIYRequest`, `DIYResponse`, `DeliveryOptions`, ...
- `services/email_service.py` – verschickt PDFs/Status-Mails.
- `services/support_service.py` – persistiert Support-Anfragen in PostgreSQL.

## 4. Environment-Variablen

| Variable | Beschreibung | Beispiel |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy-URL | `postgresql://diy_user:diy_password@db:5432/diy` |
| `SMTP_HOST`, `SMTP_PORT` | Mailserver | `smtp.gmail.com`, `587` |
| `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` | Zugangsdaten | siehe `.env.example` |
| `CREWAI_WORKING_DIR` | Pfad zu `diy/` (Standard `/app/diy` im Container) | `../diy` lokal |
| `OUTPUTS_DIR` | Ablage der PDFs | `../diy/outputs` |
| `DOWNLOADS_DIR` | Temp-Verzeichnis für ZIP/Downloads | `backend/downloads` (wird bei Bedarf erstellt) |

## 5. CrewAI-Integration

```33:101:backend/services/crewai_service.py
crewai_dir = Path(settings.crewai_working_dir)  # default: /app/diy
outputs_dir = Path(settings.outputs_dir)        # -> diy/outputs
file_id = uuid.uuid4().hex[:12]
process = await asyncio.create_subprocess_exec("python", "-c", python_code, json.dumps(payload), ...)
latest_pdf = max(outputs_dir.glob("*.pdf"), key=lambda p: p.stat().st_mtime)
return latest_pdf, file_id
```

- Das Backend wartet synchron, bis CrewAI den Lauf beendet hat. Für längere Jobs empfiehlt sich ein Background Worker / Task Queue.
- Das PDF wird nach dem Lauf nach `downloads_dir` kopiert und kann über `/api/download/{file_id}` abgeholt werden.

## 6. Datenbank

- Einziger Persistenzfall ist aktuell die Support-Anfrage (`support_requests`).
- DB-Zugriff erfolgt via SQLAlchemy Session Helpers (`backend/database/db.py`).
- Migrationen sind noch nicht automatisiert – Änderungen an Modellen bitte dokumentieren und SQL-Skripte bereitstellen.

## 7. Health & Monitoring

```bash
curl http://localhost:8000/api/health          # Healthcheck
docker compose logs backend                    # API-Logs
docker compose logs crewai                     # CrewAI/PDF-Logs
docker exec -it diy_db psql -U diy_user -d diy # DB-Inspektion
```

## 8. Tests & TODOs

- Aktuell keine automatisierten Tests vorhanden.
- Nächste Schritte:
  - Background Tasks für CrewAI (z. B. Celery, Dramatiq)
  - Retry/Timeout-Strategie im `crewai_service`
  - Umfangreicheres Input-Rate-Limiting / Auth
  - Unit-Tests für Services (Mock von CrewAI)

Weitere Details zur Gesamtarchitektur: `docs/README_FULLSTACK.md`.

