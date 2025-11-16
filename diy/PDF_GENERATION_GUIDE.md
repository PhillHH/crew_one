# PDF-Generierung mit WeasyPrint - Anleitung

## Übersicht

Das PDF-Generierungssystem wurde komplett auf **WeasyPrint** umgestellt für professionelles, CSS3-basiertes Styling.

> Für eine chronologische Zusammenfassung der Migration siehe `docs/IMPLEMENTATION_SUMMARY.md`. In diesem Guide geht es ausschließlich um Bedienung und Erweiterung.

## Architektur

```
diy/src/diy/tools/print/
├── __init__.py              # Exports
├── pdfmaker.py              # Haupt-Konverter
├── templates/
│   ├── __init__.py
│   ├── base_template.py     # Template-Engine
│   └── styles/
│       ├── __init__.py
│       ├── default.css      # Standard-Theme (clean & professional)
│       └── professional.css # Premium-Theme (corporate design)
└── fonts/                   # (Optional, für Custom-Fonts)
```

## Features

✅ **Vollständiges CSS3-Styling**  
✅ **Zwei professionelle Themes** (default, professional)  
✅ **Modulare Template-Architektur**  
✅ **Automatische Seitennummerierung**  
✅ **Header/Footer Support**  
✅ **Logo-Integration**  
✅ **Code-Syntax-Highlighting**  
✅ **Tabellen, Listen, Blockquotes**  
✅ **Page-Break-Kontrolle**  
✅ **Print-Optimierungen**

## Installation

### Dependencies

```bash
# Im diy-Verzeichnis
pip install -e .
# oder
uv sync
```

### Docker

```bash
# Container neu bauen
docker compose build

# Container starten
docker compose up
```

## Verwendung

### 1. Automatische Report-Konvertierung

```python
from diy.tools import convert_report_to_pdf

# Standard (default theme)
result = convert_report_to_pdf()

# Mit Custom-Theme
result = convert_report_to_pdf(
    filename="diy_anleitung.md",
    title="Meine DIY Anleitung",
    theme='professional'
)
```

### 2. Manuelle Konvertierung

```python
from pathlib import Path
from diy.tools import convert_markdown_to_pdf

convert_markdown_to_pdf(
    source=Path("input.md"),
    target=Path("output.pdf"),
    title="Mein Dokument",
    author="Max Mustermann",
    theme='default'
)
```

### 3. Als CrewAI Tool

```python
from diy.tools import MarkdownToPdfTool

tool = MarkdownToPdfTool()

result = tool._run(
    source_path="report.md",
    output_path="report.pdf",
    title="Projektbericht",
    theme='professional'
)
```

### 4. Mit Template-Klasse

```python
from pathlib import Path
from diy.tools import PdfTemplate, TemplateConfig

# Konfiguration
config = TemplateConfig(
    title="Mein Dokument",
    author="Max Mustermann",
    theme='professional'
)

# Template erstellen
template = PdfTemplate(config, css_theme='professional')

# Markdown laden
markdown_content = Path("input.md").read_text()

# HTML generieren
html = template.build_html(markdown_content)

# PDF erstellen (mit WeasyPrint)
from weasyprint import HTML
HTML(string=html).write_pdf("output.pdf")
```

## Themes

### Default Theme (`default.css`)

**Eigenschaften:**
- Clean & Professional
- Lila Akzentfarben (#4B0082)
- DejaVu Sans Font-Stack
- Optimiert für technische Dokumentation
- Hellgraue Hintergründe für Tabellen

**Verwendung:**
```python
convert_report_to_pdf(theme='default')
```

### Professional Theme (`professional.css`)

**Eigenschaften:**
- Corporate Design
- Gradient-Effekte (Lila-Purple)
- Serif-Schrift (DejaVu Serif)
- Drop-Cap für ersten Buchstaben
- Box-Shadows und Rounded Corners
- Optimiert für Business-Dokumente

**Verwendung:**
```python
convert_report_to_pdf(theme='professional')
```

## Eigene Themes erstellen

1. **CSS-Datei erstellen:**
   ```bash
   # Datei: diy/src/diy/tools/print/templates/styles/mein_theme.css
   ```

2. **CSS-Struktur:**
   ```css
   @page {
       size: A4;
       margin: 2cm;
       /* Header/Footer Regeln */
   }
   
   body { /* ... */ }
   h1, h2, h3 { /* ... */ }
   /* ... */
   ```

3. **Theme verwenden:**
   ```python
   convert_report_to_pdf(theme='mein_theme')
   ```

## Markdown-Extensions

Das System unterstützt folgende Markdown-Extensions:

- **extra**: Tabellen, Footnotes, Attribute-Listen
- **codehilite**: Syntax-Highlighting für Code
- **sane_lists**: Verbesserte Listen-Verarbeitung
- **tables**: Tabellen-Support
- **fenced_code**: ```code``` Blöcke
- **toc**: Table of Contents
- **nl2br**: Automatische Line-Breaks

## Troubleshooting

### PDF wird nicht generiert

**Prüfen:**
1. Existiert die Markdown-Datei im `outputs/` Verzeichnis?
2. Sind WeasyPrint-Dependencies installiert?
3. Docker-Volume korrekt gemountet?

```bash
# Check im Container
docker exec -it crewai_container ls -la /app/diy/outputs/
```

### Fehler: "CSS-Theme nicht gefunden"

```python
# Verfügbare Themes prüfen
import os
themes_dir = Path(__file__).parent / "templates" / "styles"
print(list(themes_dir.glob("*.css")))
```

### Fehler: "WeasyPrint-Dependencies fehlen"

Docker neu bauen:
```bash
docker compose build --no-cache
```

### Fonts funktionieren nicht

WeasyPrint nutzt **System-Fonts**. Im Docker-Container sind verfügbar:
- DejaVu Sans, Serif, Mono
- Liberation Sans, Serif, Mono

Für Custom-Fonts:
```css
@font-face {
    font-family: 'MyFont';
    src: url('file:///app/diy/src/diy/tools/print/fonts/myfont.ttf');
}
```

## Performance-Tipps

1. **Große Dokumente splitten:** WeasyPrint ist bei >100 Seiten langsam
2. **Bilder optimieren:** Große Bilder vorher komprimieren
3. **Komplexe CSS vermeiden:** Gradients/Shadows können langsam sein

## Migration von fpdf2

**Was wurde entfernt:**
- ❌ fpdf2
- ❌ cairosvg
- ❌ Manuelle Font-Registrierung
- ❌ Custom PDF-Klasse mit Header/Footer

**Was wurde hinzugefügt:**
✅ weasyprint
✅ Template-System
✅ CSS3-Support
✅ Modulare Architektur

**Code-Migration:**

```python
# ALT (fpdf2)
from fpdf import FPDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="Hello", ln=True)

# NEU (WeasyPrint)
from diy.tools import convert_markdown_to_pdf
convert_markdown_to_pdf(
    source=Path("input.md"),
    target=Path("output.pdf")
)
```

## Weiterführende Links

- [WeasyPrint Dokumentation](https://doc.courtbouillon.org/weasyprint/)
- [CSS Paged Media](https://www.w3.org/TR/css-page-3/)
- [Markdown Python Extensions](https://python-markdown.github.io/extensions/)

## Support

Bei Fragen oder Problemen:
1. Logs prüfen: `docker compose logs crewai`
2. Linter-Fehler checken: Cursor IDE
3. WeasyPrint-Warnings beachten

