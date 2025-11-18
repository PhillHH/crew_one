# DIY CrewAI – Projektmanual

Dies ist das zentrale Navigations-Dokument für das **DIY CrewAI**-Repository.  
Es erklärt, was hier entwickelt wird, wie die Komponenten zusammenspielen und wo weiterführende Handbücher liegen.

---

## 1. Projekt in fünf Sätzen

1. **Frontend (`frontend/`)** – React + Vite mit Tailwind. Multi-Step-Formular **oder** KI-gestützter Intake-Chat, der Anforderungen sammelt und PDF-Anfragen auslöst.  
2. **Backend (`backend/`)** – FastAPI. Bietet klassische `/api/generate`-Endpunkte, verwaltet den Intake-Agenten (`/intake/*`), verschickt Mails und legt Support-Requests in Postgres ab.  
3. **CrewAI (`diy/`)** – Python-Paket, das Markdown-Berichte erzeugt und via WeasyPrint in PDFs konvertiert. Wird sowohl lokal als auch aus dem Backend heraus genutzt.  
4. **Persistenz** – PostgreSQL (Docker-Service `db`) plus Artefakte unter `diy/outputs/`.  
5. **Orchestrierung** – `docker-compose.yml` startet Frontend, Backend, CrewAI-Worker und DB in einem Netzwerk.

---

## 2. Schnellstart (lokal)

```bash
# 1) Abhängigkeiten installieren
npm install --prefix frontend
pip install -r backend/requirements.txt
pip install -e diy

# 2) .env befüllen (API-Key, SMTP, DB) – siehe backend/README.md
cp .env.example .env
echo "OPENAI_API_KEY=sk-..." >> .env

# 3) Container starten
docker compose up --build

# 4) Optional: Frontend mit HMR
npm run dev --prefix frontend   # http://localhost:5173
```

> **Tipp:** `docs/README_FULLSTACK.md` beschreibt die komplette Infrastruktur inklusive Health-Checks und Skalierungsideen.

---

## 3. Verzeichnis- und Dokumentationsübersicht

| Ordner / Datei | Zweck | Handbuch |
| --- | --- | --- |
| `/frontend` | React-App inkl. Intake-Chat und Formular | [`frontend/README.md`](frontend/README.md) |
| `/backend` | FastAPI-Services, Intake-Agent, Support | [`backend/README.md`](backend/README.md) |
| `/diy` | CrewAI + PDF-Toolchain | [`diy/README.md`](diy/README.md) |
| `/docs` | Architekturdokumente & Guides | siehe Matrix unten |
| `/docker-compose.yml` | Referenz-Stack für lokale Entwicklung | Erläutert in [`docs/README_FULLSTACK.md`](docs/README_FULLSTACK.md) |

### Dokumentations-Matrix

| Dokument | Inhalt |
| --- | --- |
| `docs/README_FULLSTACK.md` | Gesamtarchitektur, Betriebs- und Skalierungs-Guide |
| `docs/FRONTEND_IMPLEMENTATION_GUIDE.md` | Komponentenbaum, Datenfluss, Styling- & UX-Regeln |
| `docs/IMPLEMENTATION_SUMMARY.md` | Historie wichtiger Änderungen (z. B. WeasyPrint) |
| `diy/PDF_GENERATION_GUIDE.md` | Tiefgehender PDF-/Template-Guide |
| `architektur.md` | Ordner- und Asset-Übersicht mit Aufräum-Hinweisen |

---

## 4. Wie navigiere ich durch das Projekt?

1. **Einstiegspunkt wählen**  
   - UI-/UX-Anpassungen → `frontend/README.md` + Frontend Guide  
   - API/Agenten → `backend/README.md` + Fullstack Guide  
   - PDF-/CrewAI-Themen → `diy/README.md` + PDF Guide  

2. **Fachlicher Kontext**  
   - Überblick über gesamte Delivery-Pipeline im Fullstack-Guide (`docs/README_FULLSTACK.md`).  
   - Detaillierte UI-Backlog-Notizen und Komponentenregeln im Frontend-Guide.  
   - Technische Historie (z. B. warum `uiStrings` eingeführt wurde) im Implementation Summary.

3. **Troubleshooting & Betrieb**  
   - Logs & Healthchecks → Abschnitt 5 im Fullstack-Guide.  
   - Intake-Agent Debugging → `backend/services/intake_service.py` + README.  
   - PDF-Probleme → `diy/PDF_GENERATION_GUIDE.md` inkl. WeasyPrint-Tipps.

---

## 5. Häufige Aufgaben

| Aufgabe | Vorgehen |
| --- | --- |
| **Anleitung generieren (Formular)** | Frontend öffnen → Formular ausfüllen → `generateDIYReport` triggert `/api/generate`. |
| **Anleitung generieren (Intake-Chat)** | Modus „Ich brauche Hilfe …“ wählen → Chat führt durch Fragen → Vorschlag bestätigen → `/intake/finalize`. |
| **PDF herunterladen** | Erfolgt über `downloadPDF()` (Blob-Download, Dateiname `DIY-Report.pdf`). |
| **Support-Request prüfen** | Backend-Logs oder DB (`support_requests`) nach neuer ID durchsuchen. |
| **CrewAI lokal testen** | `cd diy && python -m diy.main run_with_trigger '{"project_description": "..."}'`. |

---

## 6. Contribution Guide (Kurzfassung)

1. Branch erstellen: `git checkout -b feature/<beschreibung>`.  
2. Tests/Checks:
   - Frontend: `npm run lint`, `npm run build`.  
   - Backend: `pytest` (falls vorhanden), `ruff` optional.  
3. Commit mit Conventional-Commits (`feat:`, `fix:`, `docs:` etc.).  
4. Pull Request referenziert relevante Dokumentationsabschnitte (z. B. „siehe docs/README_FULLSTACK.md – Abschnitt 3.2“).

> Detaillierte Hinweise zu offenen To-dos findest du am Ende der jeweiligen Teil-Readmes.

---

## 7. Fragen?

- **Architektur & Betrieb:** `docs/README_FULLSTACK.md`  
- **UI/UX & Komponenten:** `docs/FRONTEND_IMPLEMENTATION_GUIDE.md`  
- **PDF / CrewAI:** `diy/PDF_GENERATION_GUIDE.md`  
- **Historie & Kontext:** `docs/IMPLEMENTATION_SUMMARY.md`

Wenn Unklarheiten bleiben, schau zuerst in die passenden Unterordner-Readmes – dort steht jetzt jeweils ein Kurzmanual mit Setup, Befehlen und Ansprechpunkten.


