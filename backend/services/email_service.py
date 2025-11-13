import aiosmtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path
import logging

from backend.config import settings

logger = logging.getLogger(__name__)


async def send_pdf_email(
    recipient_email: str,
    recipient_name: str,
    pdf_path: Path,
    project_description: str
) -> bool:
    """
    Sends PDF via email with HTML template.
    
    Args:
        recipient_email: Recipient's email address
        recipient_name: Recipient's name
        pdf_path: Path to the PDF file
        project_description: Project description for email body
    
    Returns:
        True if email was sent successfully
    
    Raises:
        Exception: If email sending fails
    """
    try:
        logger.info(f"Sending email to {recipient_email}")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Deine DIY-Anleitung: {project_description[:50]}...'
        msg['From'] = f'{settings.smtp_from_name} <{settings.smtp_from_email}>'
        msg['To'] = recipient_email
        
        # HTML email body
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #4B0082 0%, #667eea 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }}
        .project-box {{
            background: #f7fafc;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
        }}
        .button {{
            display: inline-block;
            background: #4B0082;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            padding: 20px;
            border-top: 1px solid #e0e0e0;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🛠️ Deine DIY-Anleitung ist fertig!</h1>
    </div>
    <div class="content">
        <p>Hallo {recipient_name},</p>
        
        <p>vielen Dank, dass du unseren DIY-Service nutzt! Deine personalisierte Anleitung wurde erfolgreich erstellt.</p>
        
        <div class="project-box">
            <h3>📋 Dein Projekt:</h3>
            <p>{project_description}</p>
        </div>
        
        <p><strong>Was findest du in der Anleitung?</strong></p>
        <ul>
            <li>📝 Schritt-für-Schritt-Anleitung</li>
            <li>🔧 Benötigte Werkzeuge und Materialien</li>
            <li>🛒 Detaillierte Einkaufsliste mit Links</li>
            <li>⚠️ Wichtige Sicherheitshinweise</li>
            <li>💡 Profi-Tipps und Tricks</li>
        </ul>
        
        <p>Die PDF-Datei findest du im Anhang dieser E-Mail.</p>
        
        <p style="margin-top: 30px;">
            <strong>Viel Erfolg bei deinem Projekt! 🎉</strong>
        </p>
        
        <p style="font-size: 14px; color: #666;">
            Bei Fragen stehen wir dir gerne zur Verfügung.<br>
            Dein DIY CrewAI Team
        </p>
    </div>
    <div class="footer">
        <p>© 2025 DIY CrewAI | KI-gestützte DIY-Anleitungen</p>
        <p>Diese E-Mail wurde automatisch generiert.</p>
    </div>
</body>
</html>
"""
        
        # Plain text alternative
        text_body = f"""
Hallo {recipient_name},

vielen Dank, dass du unseren DIY-Service nutzt!

Dein Projekt: {project_description}

Deine personalisierte DIY-Anleitung findest du im Anhang dieser E-Mail.

Die Anleitung enthält:
- Schritt-für-Schritt-Anleitung
- Benötigte Werkzeuge und Materialien
- Detaillierte Einkaufsliste mit Links
- Wichtige Sicherheitshinweise
- Profi-Tipps und Tricks

Viel Erfolg bei deinem Projekt!

Dein DIY CrewAI Team
"""
        
        # Attach parts
        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Attach PDF
        with open(pdf_path, 'rb') as f:
            pdf_attachment = MIMEApplication(f.read(), _subtype='pdf')
            pdf_attachment.add_header(
                'Content-Disposition',
                'attachment',
                filename=f'diy_anleitung_{project_description[:20].replace(" ", "_")}.pdf'
            )
            msg.attach(pdf_attachment)
        
        # Send email
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise

