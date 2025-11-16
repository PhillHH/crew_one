# DIY (CrewAI) Paket

Dieses Verzeichnis enthält den CrewAI-Workflow inklusive PDF-Tooling und wird sowohl lokal als auch im Backend-Container genutzt.

## 1. Installation

```bash
cd diy
pip install -e .             # Editable install für lokale Entwicklung
# optional:
# uv sync                    # wenn du UV einsetzen möchtest
```

- Unterstützte Python-Versionen: `>=3.10, <3.14`.

## 2. Strukturüberblick

```
src/diy/
├── main.py          # run/train/replay/run_with_trigger
├── crew.py          # Definition der Agents & Tasks
├── config/
│   ├── agents.yaml
│   └── tasks.yaml
└── tools/
    ├── print/       # WeasyPrint-Konverter & Templates
    └── custom_tool.py
outputs/             # Generierte Markdown- & PDF-Dateien
```

## 3. Ausführung

```bash
python -m diy.main                   # Standardlauf mit Default-Inputs
python -m diy.main run_with_trigger '{"project_description": "..."}'
python -m diy.main train 5 results.json
```

- `run()` erzeugt Markdown (z. B. `outputs/arbeitsschritte.md`) und ruft danach `convert_report_to_pdf`.
- `run_with_trigger` ist der Codepfad, den das FastAPI-Backend verwendet (`backend/services/crewai_service.py`).

## 4. PDF-Toolchain

- Hauptfunktionen: `convert_markdown_to_pdf`, `convert_report_to_pdf` in `src/diy/tools/print/pdfmaker.py`.
- Templates & Themes: `src/diy/tools/print/templates/`.
- Dokumentation & Troubleshooting: `diy/PDF_GENERATION_GUIDE.md` + `docs/IMPLEMENTATION_SUMMARY.md`.

## 5. Konfiguration & Settings

- Agents/Tasks werden über `src/diy/config/*.yaml` gepflegt.
- `diy/outputs/` dient als gemeinsames Volume mit dem Backend; alte Artefakte bei Bedarf aufräumen.
- Relevante Environment-Variablen werden im Backend (`backend/config.py`) definiert (`crewai_working_dir`, `outputs_dir`, …).

## 6. Tipps

- Bei neuen Themes CSS-Dateien unter `templates/styles/` ergänzen und im Guide dokumentieren.
- Für Debugging `WEASYPRINT_DEBUG=1` setzen, um WeasyPrint-Logs zu erweitern.
- Vor Deployments sicherstellen, dass `pip install -e .` auf dem Zielsystem ausgeführt wurde (oder das Paket via Wheel installieren).

Weitere Kontextinfos: `docs/README_FULLSTACK.md`, `architektur.md`.

