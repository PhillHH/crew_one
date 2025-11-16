# DIY CrewAI – Betriebs- & Skalierungsdokumentation

> **Zielgruppe:** Entwickler:innen & DevOps, die das Projekt übernehmen oder horizontal skalieren wollen.  
> **Single Source of Truth:** Dieses Dokument beschreibt den Gesamtverbund. Spezialthemen werden über die Dokumentationsmatrix am Ende verlinkt.

## 1. TL;DR – Was ist produktiv?

- **Frontend:** React + Vite + Tailwind (`frontend/`), Multi-Step-Formular **oder** AI-Intake-Chat (`frontend/src/components/IntakeChat/IntakeChat.tsx`), ruft die Backend-API via `frontend/src/services/api.js` bzw. `frontend/src/services/intake.ts` auf.
- **Backend:** FastAPI (`backend/`), orchestriert CrewAI-Aufrufe, Intake-Agent (`/intake/...`), verschickt E-Mails und verwaltet Support-Requests.
- **CrewAI-Paket:** Python (`diy/src/diy/`), generiert Markdown-Reports und PDFs (WeasyPrint).
- **Persistenz:** PostgreSQL (Docker-Service `db`), Datei-Ausgaben unter `diy/outputs/`.
- **Container-Orchestrierung:** `docker-compose.yml` (lokal & als Vorlage für Deployment).

## 2. Architektur & Verantwortlichkeiten

Die Ordnerstruktur ist in `architektur.md` aufgearbeitet; dort finden sich ebenfalls die aufgeräumten Pfade. Kurzüberblick:

```
crew_one/
├── frontend/      # React-App + Tailwind
├── backend/       # FastAPI + Dienste
├── diy/           # CrewAI + PDF-Tooling
├── docs/          # Diese Dokumente
└── docker-compose.yml
```

| Ebene | Zuständig | Kern-Dateien |
| --- | --- | --- |
| Frontend | Formular, UX | `frontend/src/App.jsx`, `frontend/src/components/*`, `frontend/src/utils/validation.js`, `frontend/src/components/IntakeChat/IntakeChat.tsx` |
| Backend | REST-API, CrewAI- & Intake-Trigger, Support | `backend/main.py`, `backend/routers/diy.py`, `backend/routers/intake.py`, `backend/services/*.py` |
| CrewAI | Agentenlauf, PDF-Erstellung | `diy/src/diy/main.py`, `diy/src/diy/crew.py`, `diy/src/diy/tools/print/pdfmaker.py` |

### Laufzeitfluss (Happy Path)

**Variante A – Formular (unverändert)**

1. Nutzer:in füllt das Formular im Frontend aus (`generateDIYReport` in `frontend/src/services/api.js`).
2. `POST /api/generate` landet im Backend-Router `backend/routers/diy.py`, der Inputs validiert und `generate_diy_report` startet.
3. Das Service `backend/services/crewai_service.py` wechselt in das CrewAI-Verzeichnis, führt `diy.main.run()` aus und wartet auf neue PDFs in `diy/outputs/`.
4. Der Backend-Response liefert `file_id`, Download-Link und optional Support-IDs an das Frontend zurück.
5. Das Frontend zeigt das Ergebnis in `SuccessModal` an und lädt das PDF herunter.

**Variante B – Intake-/Scoping-Agent**

1. Nutzer:in aktiviert den Toggle „Ich brauche Hilfe …“, wodurch `frontend/src/components/IntakeChat/IntakeChat.tsx` einen SSE-Stream mit `/intake/chat/stream` startet.
2. Das Backend ruft `backend/services/intake_service.py` (Standardmodell `gpt-4o-mini`, über `OPENAI_MODEL` konfigurierbar) auf, streamt Antworten tokenweise und füllt ein `DIYRequirementDraft`.
3. Der Agent bündelt maximal drei Dialogrunden, stellt mehrere thematisch passende Fragen pro Antwort, fasst zusammen und erstellt danach einen vollständigen Vorschlag. Zwei kurze Refinement-Runden sind möglich, danach fordert ALVA eine finale Bestätigung.
4. Der Vorschlag erscheint im rechten Panel und kann entweder
   - ins Formular übernommen und dort editiert werden (klassischer Flow mit `POST /api/generate`) oder
   - direkt finalisiert werden (`POST /intake/finalize` → CrewAI/PDF).
5. Beide Wege enden im bestehenden Success-/Error-Flow inklusive PDF-Download bzw. E-Mail-Hinweisen.

```33:70:backend/services/crewai_service.py
process = await asyncio.create_subprocess_exec(
    "python", "-c", python_code, json.dumps(payload),
    cwd=str(crewai_dir), stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE
)
# stdout/stderr werden ins Logging übernommen; Fehler werfen Exceptions
```

## 3. Lokales Setup (mit Kommentaren)

```bash
# 1) Abhängigkeiten installieren
npm install --prefix frontend      # Frontend libs
pip install -r backend/requirements.txt  # Backend (uvicorn etc.)
pip install -e diy                 # CrewAI-Paket (entwicklungsmodus)

# 2) Umgebungsvariablen setzen (SMTP muss für PDF-Mailversand gefüllt sein)
cp .env.example .env
echo "SMTP_USER=dein-mail@smtp" >> .env
echo "OPENAI_API_KEY=sk-..." >> .env   # Intake-Agent
# optional: OPENAI_MODEL=gpt-4o-mini (default)

# 3) Container starten – erzeugt auch PostgreSQL & bindet diy/outputs ein
docker compose up --build

# 4) Frontend im Dev-Mode (optional für HMR)
npm run dev --prefix frontend      # lauscht auf http://localhost:5173
```

> **Hinweis:** `docker-compose.yml` mountet das komplette Repo nach `/app`, das Backend konsumiert `./diy` innerhalb des Containers direkt als Modul. Änderungen an `diy/` wirken ohne rebuild.

## 4. Service-Details

### Frontend
- Komponentenbaum und Zustandslogik siehe `docs/FRONTEND_IMPLEMENTATION_GUIDE.md`.
- Validierung via Zod (`frontend/src/utils/validation.js`) spiegelt 1:1 das Backend-Schema, inkl. Pflichtfelder für Kontakt.
- AI-Intake-Modus:
  - Toggle/State in `frontend/src/App.jsx`
  - `frontend/src/components/IntakeChat/IntakeChat.tsx` bündelt maximal drei Runden, zeigt Vorschläge im rechten Panel, erlaubt zwei Refinement-Schleifen und bietet Buttons für „ins Formular übernehmen“ oder „direkt finalisieren“.
  - Typisierte API-Wrapper (`frontend/src/services/intake.ts`) kapseln SSE-Handling + optionalen Finalize-Call.
- To-do-Liste für UI-Optimierungen ist im Guide dokumentiert (z. B. visuelle Tests, responsives Verhalten).

### Backend
- FastAPI-App in `backend/main.py` bindet DIY- sowie Intake-Router und initialisiert DB + CORS.

```36:55:backend/main.py
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, ...)
app.include_router(diy.router)       # klassische PDF-Generierung
app.include_router(intake.router)    # Intake-Chat (Streaming + Finalize)
```

- Settings (`backend/config.py`) lesen die Pfade für CrewAI (`/app/diy`) und Outputs (`/app/diy/outputs`), damit Container und lokale Entwicklung identisch funktionieren.
- Neue Settings: `OPENAI_API_KEY` (für `backend/services/intake_service.py`).

### Intake-/Scoping-Agent (Backend Detail)

- Modelle: `backend/models/intake.py` enthält `DIYRequirementDraft`, die finale `DIYRequirement`-Pydantic-Struktur sowie DTOs für Chat/Finalize.
- Service: `backend/services/intake_service.py` definiert den Systemprompt (ALVA), erzwingt JSON (`response_format=json_object`), validiert jeden Schritt via Pydantic und liefert `is_complete` + Draft/Fertig-Objekt zurück.
- Router:
  - `POST /intake/chat/stream` – StreamingResponse (SSE) mit Chat-Deltas, Draft-Snapshot und Status (inkl. optionalem finalem Requirement).
  - `POST /intake/finalize` – validiert Draft, erzeugt PDF via CrewAI und (optional) E-Mail/Support.

### CrewAI / PDF
- Einstieg `diy/src/diy/main.py`: ruft `Diy().crew().kickoff()` mit den Formularparametern auf und triggert `convert_report_to_pdf(...)`.
- PDF-Generierung ist in `diy/src/diy/tools/print/pdfmaker.py` gekapselt; Details stehen in `diy/PDF_GENERATION_GUIDE.md`.

## 5. Skalierung & Betrieb

| Ebene | Tuning | Hinweise |
| --- | --- | --- |
| Backend | Uvicorn-Worker skalieren, Celery/Background Tasks für lange PDF-Jobs | Aktuell blockiert `generate_diy_report` bis CrewAI fertig ist. Für horizontale Skalierung am besten Worker queue einziehen. |
| CrewAI | Separate Worker-Container oder Kubernetes-Jobs | `settings.crewai_working_dir` zeigt derzeit auf `/app/diy`; bei mehreren Arbeitsknoten sollten Outputs in ein Shared Volume. |
| Frontend | Build auf CDN (z. B. Vercel) deployen | API-URL über `VITE_API_URL` setzen. |
| Datenbank | Postgres-Managed Service | Migrationstool noch nicht integriert; DDL liegt implizit in SQLAlchemy-Models. |

Monitoring & Troubleshooting (Auszug):

```bash
docker compose logs backend         # API-Fehler / SMTP
docker compose logs crewai          # CrewAI-Läufe + PDF-Erstellung
docker exec -it diy_db psql ...     # Datenbank prüfen
curl http://localhost:8000/api/health  # Healthcheck
```

## 6. Sicherheit & Compliance

- CORS akzeptiert aktuell nur die in `backend/config.py` definierte Originliste (lokal + Container).
- Tokens/Auth fehlen bewusst, weil es ein interner Prototyp ist. Für Produktivbetrieb sollten ergänzt werden:
  - OAuth/JWT für `/api/generate`
  - Signierte Download-Links
  - Rate Limiting (FastAPI-Middleware oder API-Gateway)
- Secrets verwalten: `.env` wird lokal genutzt; in Cloud-Deployments auf Secrets Manager wechseln.

## 7. Dokumentationsmatrix

| Dokument | Zweck |
| --- | --- |
| `docs/README_FULLSTACK.md` (dies) | Gesamtarchitektur, Betrieb, Skalierung |
| `architektur.md` | Schneller Überblick über Verzeichnisstruktur & Duplikat-Bereinigung |
| `docs/FRONTEND_IMPLEMENTATION_GUIDE.md` | Komponentenarchitektur, Stilrichtlinien, UI-Backlog |
| `docs/IMPLEMENTATION_SUMMARY.md` | Kurzchronik wichtiger Implementierungs-Meilensteine (z. B. WeasyPrint) |
| `diy/PDF_GENERATION_GUIDE.md` | Tiefgehender Leitfaden für PDF-/Template-Entwicklung |
| `frontend/README.md`, `backend/README.md`, `diy/README.md` | Feingranulare Befehle/Envs für jedes Teilprojekt |

## 8. Contribution & Roadmap

- **Frontend:** Fokus auf Validierungen, Progress-Anzeige, Tests (React Testing Library), Accessibility.
- **Backend:** Background-Processing, Observability (OpenTelemetry), Payment/Support-Erweiterungen.
- **CrewAI:** Prompt-/Agentenpflege, alternative Themes, Mehrsprachigkeit.

```bash
# Git-Workflow (Kommentarzeilen beschreiben die Schritte)
git checkout -b feature/<kurzbeschreibung>   # Feature-Branch anlegen
pnpm/vite/npm test                           # (Frontend) Tests ausführen
pytest/ruff (optional)                       # Falls Backend-Tests ergänzt wurden
git commit -am "feat: <beschreibung>"        # Commit mit Conventional Commits
```

Bleibende Fragen? → Siehe `docs/FRONTEND_IMPLEMENTATION_GUIDE.md` für UI, `diy/PDF_GENERATION_GUIDE.md` für WeasyPrint oder kontaktiere das Team per Slack/GitHub.

