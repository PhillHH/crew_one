# Implementierungs-Historie (PDF-Stack & CrewAI)

Diese Datei dient als kompakte Chronik der wichtigsten Änderungen – das ausführliche „How-to“ liegt im `diy/PDF_GENERATION_GUIDE.md`.  
Stand: **November 2025**.

## 1. Motivation & Scope

- Ablösung der alten fpdf2/cairosvg-Pipeline durch WeasyPrint, um CSS-basiertes Styling zu ermöglichen.
- Vereinheitlichung der Dateiablage (`diy/outputs/`) und Export-API (CLI, CrewAI-Tool, Backend-Service).
- Dokumentation der Systemvoraussetzungen (Linux-Pakete, Python-Abhängigkeiten) für reproduzierbare Builds.

## 2. Wesentliche Änderungen

| Thema | Beschreibung | Quelle |
| --- | --- | --- |
| Dependency-Update | `diy/pyproject.toml` und Root-`requirements.txt` auf WeasyPrint umgestellt. | Commit vom 11.11.2025 |
| Template-System | Neue Struktur `diy/src/diy/tools/print/templates/` mit `TemplateConfig`, `PdfTemplate` und zwei CSS-Themes. | `base_template.py`, `styles/*.css` |
| Konverter-API | `convert_markdown_to_pdf()` & `convert_report_to_pdf()` validieren Eingaben, erzeugen PDFs direkt in `diy/outputs`. | `diy/src/diy/tools/print/pdfmaker.py` |
| CLI/Tooling | `MarkdownToPdfTool` exportiert als CrewAI-Tool; Dockerfile enthält die WeasyPrint-Libs. | `diy/src/diy/tools/__init__.py`, `Dockerfile` |
| Dokumentation | Dieser Überblick + Deep Dive in `diy/PDF_GENERATION_GUIDE.md`. | docs |

```101:135:diy/src/diy/tools/print/pdfmaker.py
md_path = base_dir / "outputs" / filename
outputs_dir = base_dir / "outputs"
outputs_dir.mkdir(parents=True, exist_ok=True)
return convert_markdown_to_pdf(
    source=md_path,
    target=outputs_dir / md_path.with_suffix(".pdf").name,
    title=title,
    theme=theme,
    logo_path=logo
)
```

## 3. Test- & Rollout-Checkliste

```bash
docker compose build         # stellt sicher, dass apt-Pakete + Python-Deps installiert sind
docker compose up crewai     # PDF-Worker starten (Logs prüfen)
docker compose logs crewai   # nach „PDF erstellt“ suchen
ls diy/outputs               # Ergebnis-PDFs sichtbar?
```

Visuelle Kontrolle: PDF öffnen → Header/Footer, Tabellen, Listen, Codeblöcke prüfen (Details im Guide).  
Optional: `convert_report_to_pdf(theme='professional')` ausprobieren, um das zweite Theme zu verifizieren.

## 4. Bekannte Nacharbeiten

- [ ] Logo-/Branding-Support (Datei-Upload, Pfad in `.env` konfigurieren).
- [ ] Rendering-Tests (Golden Files) für Styles.
- [ ] Mehrsprachige Templates (z. B. `TemplateConfig.language`).
- [ ] Monitoring der Laufzeit (WeasyPrint-Warnungen parsen).

## 5. Weiterführende Unterlagen

- `diy/PDF_GENERATION_GUIDE.md` – Schritt-für-Schritt-Anleitung inkl. Themes, Troubleshooting, Beispielcode.
- `docs/README_FULLSTACK.md` – Gesamtarchitektur & Bezug zum Backend.
- `architektur.md` – Überblick über aufgeräumte Verzeichnisse.

> **Hinweis:** Neue Änderungen bitte hier kurz eintragen (Datum, Kernaussage) und im PDF-Guide detaillieren, damit künftige Entwickler:innen die Historie nachvollziehen können.

