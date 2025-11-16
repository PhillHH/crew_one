# Frontend (React + Vite)

Dieses README bündelt alle projektspezifischen Infos für das React-Frontend.

## Setup

```bash
npm install                   # Dependencies
cp ../.env.example .env.local # optional: eigene VITE_API_URL setzen
```

- Standard-API-URL: `http://localhost:8000`.  
- Im Deployment übergibt `docker-compose` die API via Nginx (`frontend/Dockerfile`).

## Befehle

```bash
npm run dev        # HMR auf http://localhost:5173
npm run build      # Produktionsbundle (-> dist/)
npm run preview    # Vorschau des gebauten Bundles
npm run lint       # ESLint (optional aktivieren)
```

> **Kommentar:** Tailwind nutzt JIT. Wenn neue Pfade auftauchen, `tailwind.config.js` → `content` erweitern.

## Struktur

```
src/
├── App.jsx                  # Einstieg, orchestriert Request-Flow
├── components/
│   ├── Hero.jsx
│   ├── ProjectForm/...
│   ├── LoadingModal.jsx
│   ├── SuccessModal.jsx
│   └── ErrorModal.jsx
├── services/api.js          # axios-Instanz + Helper
├── utils/validation.js      # Zod-Schema + Transform
└── styles/globals.css       # Gemeinsame Utility-Klassen
```

## Entwicklungshinweise

- Formvalidierung: `react-hook-form` + `zodResolver`. Anpassungen immer im Schema vornehmen.
- Responses vom Backend liefern `pdf_url`, `file_id`, `email_sent`, `support_request_id`. Der `SuccessModal` zeigt alle Felder an.
- Fehlerhandling: `generateDIYReport` wirft Exceptions → `App.jsx` setzt `errorMessage` und öffnet `ErrorModal`.

## Qualität & Backlog

- Tests: React Testing Library + Cypress/Playwright (noch offen).
- Accessibility: Fokus, ARIA-Labels, Tastaturnavigation prüfen.
- i18n: Strings derzeit deutsch; bei Bedarf in Dictionary auslagern.

Für tiefergehende Details siehe `docs/FRONTEND_IMPLEMENTATION_GUIDE.md` und `docs/README_FULLSTACK.md`.
