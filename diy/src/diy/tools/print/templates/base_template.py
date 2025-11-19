from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
from datetime import datetime
import markdown


@dataclass
class TemplateConfig:
    """Konfiguration für PDF-Template."""
    
    title: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    logo_path: Optional[Path] = None
    theme: str = 'default'
    
    def __post_init__(self):
        """Validiert die Konfiguration."""
        if self.date is None:
            self.date = datetime.now().strftime("%d.%m.%Y")
        
        if self.logo_path and not isinstance(self.logo_path, Path):
            self.logo_path = Path(self.logo_path)
        
        if self.logo_path and not self.logo_path.exists():
            raise FileNotFoundError(f"Logo nicht gefunden: {self.logo_path}")


class PdfTemplate:
    """Template-Generator für professionelle PDF-Dokumente."""
    
    def __init__(self, config: TemplateConfig, css_theme: str = 'default'):
        """
        Initialisiert das PDF-Template.
        
        Args:
            config: Template-Konfiguration
            css_theme: Name des CSS-Themes ('default' oder 'professional')
        """
        self.config = config
        self.css_theme = css_theme
        self._css_content = self.load_css_theme(css_theme)
    
    def load_css_theme(self, theme_name: str) -> str:
        """
        Lädt ein CSS-Theme aus dem styles/ Verzeichnis.
        
        Args:
            theme_name: Name des Themes ('default' oder 'professional')
            
        Returns:
            CSS-Content als String
        """
        theme_path = Path(__file__).parent / "styles" / f"{theme_name}.css"
        
        if not theme_path.exists():
            raise FileNotFoundError(
                f"CSS-Theme '{theme_name}' nicht gefunden: {theme_path}"
            )
        
        return theme_path.read_text(encoding='utf-8')
    
    def build_html(self, markdown_content: str) -> str:
        """
        Konvertiert Markdown zu vollständigem HTML-Dokument.
        
        Args:
            markdown_content: Markdown-Text
            
        Returns:
            Vollständiges HTML-Dokument als String
        """
        # Markdown → HTML mit Extensions
        md = markdown.Markdown(
            extensions=[
                'extra',
                'codehilite',
                'sane_lists',
                'tables',
                'fenced_code',
                'toc',
                'nl2br',
            ],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'linenums': False,
                },
                'toc': {
                    'title': 'Inhaltsverzeichnis',
                    'permalink': True,
                },
            }
        )
        
        html_body = md.convert(markdown_content)
        toc = getattr(md, 'toc', '')
        
        # Vollständiges HTML-Dokument bauen
        return self._wrap_content(toc + html_body)
    
    def _build_header(self) -> str:
        """
        Generiert den HTML-Header-Bereich.
        
        Returns:
            Header-HTML
        """
        header_parts = []
        
        if self.config.logo_path:
            logo_html = f'''
            <div class="header-logo">
                <img src="{self.config.logo_path}" alt="Logo" />
            </div>
            '''
            header_parts.append(logo_html)
        
        if self.config.title:
            title_html = f'<div class="header-title">{self.config.title}</div>'
            header_parts.append(title_html)
        
        if not header_parts:
            return ''
        
        return f'''
        <header class="document-header">
            {''.join(header_parts)}
        </header>
        '''
    
    def _build_footer(self) -> str:
        """
        Generiert den HTML-Footer-Bereich.
        
        Returns:
            Footer-HTML
        """
        footer_parts = []
        
        if self.config.author:
            footer_parts.append(f'<span class="footer-author">{self.config.author}</span>')
        
        if self.config.date:
            footer_parts.append(f'<span class="footer-date">{self.config.date}</span>')
        
        if not footer_parts:
            return ''
        
        return f'''
        <footer class="document-footer">
            {' | '.join(footer_parts)}
        </footer>
        '''
    
    def _wrap_content(self, html_body: str) -> str:
        """
        Wraps den HTML-Body in ein vollständiges HTML-Dokument.
        
        Args:
            html_body: HTML-Content
            
        Returns:
            Vollständiges HTML-Dokument
        """
        header = self._build_header()
        footer = self._build_footer()
        
        return f'''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.config.title or "PDF Dokument"}</title>
    <style>
        {self._css_content}
    </style>
</head>
<body>
    {header}
    <main class="document-content">
        {html_body}
    </main>
    {footer}
</body>
</html>'''

