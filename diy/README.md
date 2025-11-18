# DIY (CrewAI) Paket

CrewAI-Workflow samt PDF-Tooling. Wird als eigenständiges Python-Paket eingebunden (lokal und im Backend-Container).

---

## 1. Installation

```bash
cd diy
pip install -e .            # Editable Install für Entwicklung
# optional: uv sync         # wenn UV genutzt wird
```

- Unterstützte Python-Versionen: `>=3.10, <3.14`  
- Abhängigkeiten (WeasyPrint etc.) werden via `pyproject.toml` verwaltet.

---

## 2. Strukturüberblick

```
diy/
├── src/diy/
│   ├── main.py           # CLI-Einstieg (run, train, run_with_trigger)
│   ├── crew.py           # Agenten- & Task-Definitionen
│   ├── config/
│   │   ├── agents.yaml
│   │   └── tasks.yaml
│   └── tools/
│       ├── print/        # WeasyPrint-Konverter & Templates
│       └── custom_tool.py
├── outputs/              # Markdown- und PDF-Ergebnisse
└── README.md             # dieses Dokument
```

---

## 3. Ausführung & Schnittstellen

```bash
python -m diy.main                            # Standardlauf mit Default-Input
python -m diy.main run_with_trigger '{"project_description": "..."}'
python -m diy.main train 5 results.json
```

- `run_with_trigger` ist der Weg, den das Backend (`services/crewai_service.py`) nutzt.  
- Ergebnisse (Markdown + PDF) landen in `diy/outputs/`. Der Backend-Downloader greift anschließend darauf zu.

---

## 4. PDF-Toolchain & Themen

- Kernfunktionen: `convert_markdown_to_pdf`, `convert_report_to_pdf` in `src/diy/tools/print/pdfmaker.py`.  
- Templates, Themes & CSS unter `src/diy/tools/print/templates/` (`styles/default.css`, `styles/professional.css`).  
- Detailhandbuch: [`diy/PDF_GENERATION_GUIDE.md`](PDF_GENERATION_GUIDE.md) – enthält Troubleshooting, Theme-Erweiterungen und WeasyPrint-Hinweise.

---

## 5. Konfiguration

| Bereich | Datei / Variable | Beschreibung |
| --- | --- | --- |
| Agenten & Tasks | `src/diy/config/agents.yaml`, `tasks.yaml` | Rollen, Ziele, Prompts. |
| Arbeitsverzeichnis | `CREWAI_WORKING_DIR` (Backend Setting) | Zeigt auf dieses Verzeichnis. |
| Outputs | `OUTPUTS_DIR` | Standard: `../diy/outputs/` – wird Container-übergreifend gemounted. |
| Themes | `src/diy/tools/print/templates/styles/*.css` | Neue Themes hier ergänzen + im PDF-Guide dokumentieren. |

---

## 6. Tipps & Debugging

- `WEASYPRINT_DEBUG=1` setzen, um detailliertere Logs zu erhalten.  
- Artefakte regelmäßig aufräumen (`diy/outputs/`); das Backend nutzt die aktuellste Datei.  
- Für reproduzierbare Builds immer `pip install -e .` (oder Wheel) auf Zielsystemen ausführen.  
- Bei Template-Anpassungen Screenshots/Notizen im `PDF_GENERATION_GUIDE.md` ergänzen.

Weitere Kontextinfos:  
- [`docs/README_FULLSTACK.md`](../docs/README_FULLSTACK.md) – wie CrewAI ins Gesamtsystem eingebettet ist.  
- [`docs/IMPLEMENTATION_SUMMARY.md`](../docs/IMPLEMENTATION_SUMMARY.md) – Historie der WeasyPrint-Migration.
