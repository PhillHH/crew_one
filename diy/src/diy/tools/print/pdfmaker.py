from pathlib import Path
from typing import Optional, Type
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from weasyprint import HTML, CSS

from .templates import PdfTemplate, TemplateConfig


class MarkdownToPdfInput(BaseModel):
    """Input-Schema für MarkdownToPdfTool."""
    source_path: str = Field(..., description="Pfad zur Markdown-Datei")
    output_path: str = Field(..., description="Ziel-PDF-Pfad")
    title: Optional[str] = Field(None, description="Dokument-Titel")
    theme: str = Field('default', description="CSS-Theme ('default' oder 'professional')")


def convert_markdown_to_pdf(
    source: Path,
    target: Path,
    title: Optional[str] = None,
    author: Optional[str] = None,
    theme: str = 'default',
    logo_path: Optional[Path] = None
) -> str:
    """
    Konvertiert Markdown zu PDF mit WeasyPrint.
    
    Args:
        source: Pfad zur Markdown-Datei
        target: Ziel-PDF-Pfad
        title: Dokument-Titel (optional)
        author: Autor (optional)
        theme: CSS-Theme ('default' oder 'professional')
        logo_path: Pfad zum Logo (optional)
    
    Returns:
        Erfolgsmeldung mit Pfad
        
    Raises:
        FileNotFoundError: Wenn Markdown-Datei nicht existiert
        ValueError: Wenn Theme ungültig ist
    """
    # Validierung
    if not source.exists():
        raise FileNotFoundError(f"Markdown-Datei nicht gefunden: {source}")
    
    if theme not in ['default', 'professional']:
        raise ValueError(f"Ungültiges Theme: {theme}. Erlaubt: 'default', 'professional'")
    
    # Ausgabeverzeichnis erstellen
    target.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Template-Konfiguration erstellen
        config = TemplateConfig(
            title=title,
            author=author,
            logo_path=logo_path,
            theme=theme
        )
        
        # Template instanziieren
        template = PdfTemplate(config, css_theme=theme)
        
        # Markdown einlesen
        markdown_content = source.read_text(encoding='utf-8')
        
        # HTML generieren
        html_document = template.build_html(markdown_content)
        
        # PDF generieren mit WeasyPrint
        HTML(string=html_document).write_pdf(target)
        
        return f"PDF erfolgreich gespeichert unter: {target}"
        
    except Exception as e:
        raise Exception(f"Fehler beim Erstellen des PDFs: {str(e)}") from e


def convert_report_to_pdf(
    filename: str = "diy_anleitung.md",
    title: Optional[str] = "DIY Anleitung",
    theme: str = 'default',
    logo_path: Optional[str] = None
) -> Optional[str]:
    """
    Helper-Funktion für automatische Report-Konvertierung.
    Sucht im outputs/ Verzeichnis nach der MD-Datei.
    Falls nicht gefunden, sucht im Parent-Verzeichnis nach report.md.
    
    Args:
        filename: Name der Markdown-Datei (Standard: "diy_anleitung.md")
        title: Titel für das PDF-Dokument
        theme: CSS-Theme ('default' oder 'professional')
        logo_path: Optionaler Pfad zum Logo
    
    Returns:
        Erfolgsmeldung oder None wenn Datei nicht gefunden
    """
    # Basis-Verzeichnis ermitteln (4 Ebenen hoch von pdfmaker.py)
    base_dir = Path(__file__).resolve().parents[4]
    
    # Markdown-Datei im outputs/ Verzeichnis suchen
    md_path = base_dir / "outputs" / filename
    
    if not md_path.exists():
        # Fallback: Suche nach report.md im base_dir
        fallback_path = base_dir / "report.md"
        if fallback_path.exists():
            print(f"Info: {filename} nicht in outputs/ gefunden, verwende {fallback_path}")
            md_path = fallback_path
            filename = "report.md"
        else:
            print(f"Warnung: Markdown-Datei nicht gefunden: {md_path} oder {fallback_path}")
            return None
    
    # Output-Verzeichnis für PDFs (im gemounteten outputs/ Verzeichnis)
    outputs_dir = base_dir / "outputs"
    outputs_dir.mkdir(parents=True, exist_ok=True)
    
    # PDF-Pfad generieren
    pdf_path = outputs_dir / md_path.with_suffix(".pdf").name
    
    # Logo-Pfad konvertieren
    logo = Path(logo_path) if logo_path else None
    
    try:
        return convert_markdown_to_pdf(
            source=md_path,
            target=pdf_path,
            title=title,
            theme=theme,
            logo_path=logo
        )
    except Exception as e:
        print(f"Fehler bei PDF-Konvertierung: {e}")
        return None


class MarkdownToPdfTool(BaseTool):
    """CrewAI-Tool für Markdown zu PDF Konvertierung."""
    
    name: str = "markdown_to_pdf"
    description: str = (
        "Konvertiert Markdown-Dateien zu professionellen PDFs mit WeasyPrint. "
        "Unterstützt verschiedene Themes und vollständiges CSS3-Styling."
    )
    args_schema: Type[BaseModel] = MarkdownToPdfInput

    def _run(
        self,
        source_path: str,
        output_path: str,
        title: Optional[str] = None,
        theme: str = 'default'
    ) -> str:
        """
        Führt die Markdown zu PDF Konvertierung aus.
        
        Args:
            source_path: Pfad zur Markdown-Datei
            output_path: Ziel-PDF-Pfad
            title: Dokument-Titel
            theme: CSS-Theme
            
        Returns:
            Erfolgsmeldung
        """
        return convert_markdown_to_pdf(
            Path(source_path),
            Path(output_path),
            title=title,
            theme=theme
        )
