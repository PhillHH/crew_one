# DIY CrewAI - Full Stack Application

## 🎯 Überblick

Eine vollständige Web-Anwendung mit React-Frontend und FastAPI-Backend, die KI-gestützte DIY-Anleitungen generiert.

### Features

✅ **React Frontend** - Multi-Step-Formular für Projektbeschreibung  
✅ **FastAPI Backend** - REST API mit CrewAI-Integration  
✅ **PostgreSQL** - Speicherung von Support-Anfragen  
✅ **E-Mail-Service** - Automatischer Versand der PDFs  
✅ **PDF-Generierung** - WeasyPrint mit professionellem Styling  
✅ **Docker Compose** - Alle Services orchestriert  

## 🏗️ Architektur

```
crew_one/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL
├── diy/               # CrewAI (bestehend)
├── docker-compose.yml # Orchestrierung aller Services
└── nginx.conf         # Reverse Proxy
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (für lokale Development)
- Python 3.11+ (für lokale Development)

### 1. Environment Setup

```bash
# Kopiere .env.example zu .env (bereits in FRONTEND_IMPLEMENTATION_GUIDE.md)
# und fülle SMTP-Credentials aus
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

### 2. Frontend Dependencies installieren

```bash
cd frontend
npm install
cd ..
```

### 3. Alle Services starten

```bash
# Build und Start
docker compose up --build

# Im Hintergrund
docker compose up -d --build
```

### 4. Zugriff

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **PostgreSQL:** localhost:5432

## 📦 Services

### Frontend (Port 3000)
- **Tech Stack:** React 18, Vite, Tailwind CSS
- **Features:** Multi-Step-Form, Validation (Zod), API-Integration (Axios)
- **Container:** Nginx (Production Build)

### Backend (Port 8000)
- **Tech Stack:** FastAPI, SQLAlchemy, Pydantic
- **Features:** 
  - `/api/generate` - PDF-Generierung
  - `/api/download/{id}` - PDF-Download
  - `/api/support` - Support-Anfrage erstellen
  - `/api/health` - Health Check
- **Validierung:** E-Mail, Telefon (DE-Format), Form-Constraints

### Database (Port 5432)
- **PostgreSQL 16**
- **Tables:** support_requests
- **Connection:** `postgresql://diy_user:diy_password@db:5432/diy`

### CrewAI
- **Bestehender Service** - Generiert DIY-Reports
- **Integration:** Über Python-Subprocess vom Backend

## 🛠️ Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload  # http://localhost:8000
```

### Database Migrations

```bash
# Zugriff zur DB
docker exec -it diy_db psql -U diy_user -d diy

# Tabellen anzeigen
\dt

# Support-Requests anzeigen
SELECT * FROM support_requests;
```

## 📝 API Dokumentation

### POST `/api/generate`

**Request:**
```json
{
  "project_description": "Eine Wand tapezieren...",
  "experience_level": "beginner",
  "delivery_options": {
    "download": true,
    "email": true
  },
  "support_options": {
    "phone_support": true,
    "onsite_support": false,
    "location": null
  },
  "contact": {
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+4915112345678"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF wurde erfolgreich erstellt",
  "pdf_url": "/api/download/abc123def456",
  "file_id": "abc123def456",
  "support_request_id": "SR-12345",
  "email_sent": true
}
```

## 🔒 Sicherheit

### Aktuelle Implementation:
- CORS aktiviert für localhost
- File-IDs sind zufällige UUIDs

### Production Empfehlungen:
- [ ] HTTPS (Let's Encrypt)
- [ ] Rate Limiting
- [ ] JWT Authentication
- [ ] Zeitlimitierte Download-Links
- [ ] SMTP über sichere Provider (SendGrid/Mailgun)
- [ ] Environment-Variables verschlüsseln
- [ ] SQL-Injection Protection (SQLAlchemy ORM ✅)
- [ ] Input Validation (Pydantic ✅)

## 🐛 Troubleshooting

### Backend startet nicht
```bash
# Logs prüfen
docker compose logs backend

# Häufige Probleme:
# - Database nicht ready → Wait for health check
# - SMTP-Credentials fehlen → .env prüfen
```

### Frontend kann Backend nicht erreichen
```bash
# Network prüfen
docker network inspect crew_one_diy-network

# Proxy-Konfiguration prüfen
docker exec -it diy_frontend cat /etc/nginx/conf.d/default.conf
```

### PDF wird nicht generiert
```bash
# CrewAI-Logs prüfen
docker compose logs crewai

# Outputs-Verzeichnis prüfen
docker exec -it crewai_container ls -la /app/diy/outputs/
```

### E-Mail wird nicht versendet
```bash
# SMTP-Logs prüfen
docker compose logs backend | grep -i smtp

# Gmail: App-Passwort verwenden (nicht reguläres Passwort!)
# https://support.google.com/accounts/answer/185833
```

## 📊 Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:8000/api/health

# Database
docker exec diy_db pg_isready -U diy_user

# Alle Services
docker compose ps
```

### Logs

```bash
# Alle Services
docker compose logs -f

# Nur Backend
docker compose logs -f backend

# Nur Frontend
docker compose logs -f frontend
```

## 🚢 Deployment

### Production Build

```bash
# Build für Production
docker compose -f docker-compose.prod.yml up -d --build

# Mit Environment-Variablen
SMTP_USER=prod@example.com SMTP_PASSWORD=xxx docker compose up -d
```

### Cloud Deployment

**Empfohlene Plattformen:**
- **Frontend:** Vercel / Netlify
- **Backend:** AWS ECS / DigitalOcean App Platform
- **Database:** AWS RDS / DigitalOcean Managed PostgreSQL
- **SMTP:** SendGrid / Mailgun (10k+ E-Mails/Monat)

## 📚 Weitere Dokumentation

- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Frontend-Komponenten-Details
- `PDF_GENERATION_GUIDE.md` - WeasyPrint PDF-Styling
- `IMPLEMENTATION_SUMMARY.md` - WeasyPrint Migration

## 🤝 Contributing

### Frontend

Fehlende Komponenten (siehe `FRONTEND_IMPLEMENTATION_GUIDE.md`):
- Hero.jsx
- ProjectForm/* (alle Steps)
- LoadingModal.jsx
- SuccessModal.jsx
- ErrorModal.jsx
- App.jsx
- main.jsx

### Backend

Erweiterungen:
- [ ] Admin-Dashboard für Support-Anfragen
- [ ] WebSocket für Real-Time-Updates
- [ ] PDF-Preview vor Download
- [ ] Multi-Language Support
- [ ] Payment-Integration (für Premium-Support)

## 📄 License

MIT

## 👥 Team

DIY CrewAI Team - KI-gestützte Heimwerker-Anleitungen

---

**Status:** Backend ✅ | Frontend 🚧 80% | Integration ✅ | Docker ✅

**Version:** 1.0.0

