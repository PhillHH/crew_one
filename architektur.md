# Architektur- und Strukturübersicht

## Verbindliche Laufzeitstruktur

Laut Projekt-Doku (`docs/README_FULLSTACK.md`) besteht das Repo aus drei aktiv genutzten Teilprojekten plus Infrastrukturdateien:

```18:24:docs/README_FULLSTACK.md
crew_one/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL
├── diy/               # CrewAI (bestehend)
├── docker-compose.yml # Orchestrierung aller Services
└── nginx.conf         # Reverse Proxy
```

`docker-compose.yml` koppelt genau diese Ordner in Container ein – `./backend` wird als API gebaut, `./frontend` als UI, und `./diy` wird sowohl in den CrewAI-Container als auch ins Backend gemountet:

```1:49:docker-compose.yml
services:
  crewai:
    working_dir: /app/diy
    volumes:
      - .:/app
      - ./diy/outputs:/app/diy/outputs
  backend:
    build: ./backend
    volumes:
      - ./diy:/app/diy
```

## Aktive Arbeitsverzeichnisse

- **`backend/` – FastAPI-Service**  
  `backend/main.py` erstellt die FastAPI-App, konfiguriert CORS und bindet `backend.routers.diy` ein, womit klar ist, dass dieses Verzeichnis der produktive Server ist.

```36:65:backend/main.py
app = FastAPI(
    title=settings.app_name,
    description="Backend API for DIY CrewAI - AI-powered DIY instructions",
)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, ...)
app.include_router(diy.router)
```

- **`frontend/` – React/Vite-Client**  
  Die Einstiegskomponente `frontend/src/App.jsx` importiert sämtliche UI-Teilkomponenten und ruft über `generateDIYReport`/`downloadPDF` das Backend an – dieser Ordner ist also der einzige lauffähige Client.

```1:71:frontend/src/App.jsx
import Hero from './components/Hero';
import ProjectForm from './components/ProjectForm';
...
const response = await generateDIYReport(requestPayload);
downloadPDF(successData.file_id);
```

- **`diy/src/diy` – CrewAI-Orchestrierung**  
  `diy/src/diy/main.py` startet die Agents, erzeugt Reports und triggert die PDF-Erstellung. Damit ist diese Paketstruktur die maßgebliche Codebasis für CrewAI.

```18:36:diy/src/diy/main.py
def run(inputs: Optional[Dict[str, Any]] = None):
    Diy().crew().kickoff(inputs=inputs)
    convert_report_to_pdf(title=inputs.get('title') or 'DIY Anleitung')
```

- **`diy/outputs/` – zentrale Artefakte**  
  Der PDF-Konverter sucht explizit im Top-Level `diy/outputs` nach Markdown/PDF-Dateien, legt dort PDFs ab und erzeugt das Verzeichnis bei Bedarf.

```81:135:diy/src/diy/tools/print/pdfmaker.py
base_dir = Path(__file__).resolve().parents[4]  # => diy/
md_path = base_dir / "outputs" / filename
outputs_dir = base_dir / "outputs"
outputs_dir.mkdir(parents=True, exist_ok=True)
```

## Bereinigung & entfernte Dubletten

Die Analyse (rekursiver `os.walk`-Scan, Ausschluss von `.git`, `node_modules`, virtuellen Envs) ergab mehrere leere oder funktionslose Kopien. Entfernt wurden:

| Pfad | Grund |
| --- | --- |
| `backend/downloads` | Leerer Stub, keine Referenzen im Code. |
| `diy/backend` inkl. `database/`, `models/`, `routers/`, `services/` | Vollständige, aber ungenutzte Kopie des produktiven Backends. |
| `diy/frontend` | Platzhalter ohne Dateien, nicht im Build referenziert. |
| `diy/tests` | Leer; es existiert kein Test-Setup in `pyproject` oder CI. |
| `diy/diy` (mit `outputs/` und `src/diy/...`) | Redundanter Import des CrewAI-Templates; `docker-compose` und `PYTHONPATH` nutzen ausschließlich `diy/src/diy`. |
| `diy/src/diy/outputs` (inkl. `outputs/outputs`) | Historische Doppelung; alle Laufzeitpfade verweisen stattdessen auf `diy/outputs` (siehe `pdfmaker.py`). |

Alle genannten Verzeichnisse waren leer oder enthielten nur Duplikate bereits gepflegter Artefakte (`arbeitsschritte.md`, `report.pdf`, …). Damit existiert jetzt nur noch ein klarer Pfad pro Funktion.

## Offene Empfehlungen

- **Dokumentation angleichen:** README-Dateien im Wurzel- und `diy/`-Ordner sollten den bereinigten Aufbau erläutern und keine Referenzen mehr auf `diy/backend`/`diy/frontend` enthalten.
- **Outputs pflegen:** Da `diy/outputs` jetzt alleinige Quelle ist, sollten Skripte, die Artefakte konsumieren oder versionieren, ausschließlich diesen Pfad verwenden.
- **Optional:** Wenn weitere Platzhalter entstehen (z. B. neue Agent-Templates), direkt mit einer README kennzeichnen, damit spätere Scans sie nicht als „verwaist“ interpretieren.

_Letzte Aktualisierung: 2025-11-13 · Grundlage: vollständiger Verzeichnis-Scan + Code-Quellen wie oben referenziert._


