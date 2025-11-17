# Frontend (React + Vite)

Dieses README erklärt das React-Frontend, seine Befehle sowie die neuen Enttechnisierungs-Regeln (UI-Texte, ViewModel, Fehlermeldungen).

---

## 1. Setup & Befehle

```bash
npm install                     # Dependencies
cp ../.env.example .env.local   # optional: eigene VITE_API_URL setzen

npm run dev        # HMR auf http://localhost:5173
npm run build      # Produktionsbundle (-> dist/)
npm run preview    # Vorschau des Builds
npm run lint       # ESLint (sofern konfiguriert)
```

- Standard-API-URL: `http://localhost:8000` (per `VITE_API_URL` überschreibbar).
- Docker-Build → `frontend/Dockerfile` (Node Build + Nginx).

---

## 2. Architektur auf einen Blick

```
frontend/
├── src/
│   ├── App.jsx                 # orchestriert Formular / Intake-Chat
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── ProjectForm/
│   │   │   ├── index.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   └── *Step*.jsx
│   │   ├── IntakeChat/IntakeChat.tsx
│   │   ├── LoadingModal.jsx
│   │   ├── SuccessModal.jsx
│   │   └── ErrorModal.jsx
│   ├── services/
│   │   ├── api.js              # Formular-Endpunkte + Download-ViewModel
│   │   └── intake.ts           # SSE + Finalize
│   ├── utils/
│   │   ├── validation.js       # Zod-Schema + Transform
│   │   └── intake.ts           # Draft → Formular
│   ├── uiStrings.ts            # zentrale UI-Texte (deutsch)
│   └── styles/globals.css
└── README.md                   # dieses Dokument
```

---

## 3. Datenfluss & Enttechnisierung

### Formular-Flow
1. `ProjectForm` sammelt Eingaben, `transformFormData` mappt auf das Backend-Schema.
2. `generateDIYReport()` ruft `/api/generate` auf und liefert ein **ViewModel** (`{ message, canDownload, canEmail, fileId, hasSupportRequest }`).
3. `SuccessModal` zeigt nur Klartext (`uiStrings.successModal.*`) und Buttons; technische Felder verbleiben im State.
4. `downloadPDF()` nutzt `fetch + blob()` und speichert immer `DIY-Report.pdf`.

### Intake-Chat
- `IntakeChat.tsx` rendert ausschließlich Nutzer/Assistenten-Bubbles + Klartext-Labels.  
- Zwischenstände werden über das Draft-Panel mit freundlichen Labels angezeigt.  
- Fehlermeldungen unterscheiden Streaming/Finalize/Validation und stammen aus `uiStrings.errors`.

### Zentrales Text-Dictionary
- Datei: `src/uiStrings.ts`
- Enthält alle sichtbaren Texte (Hero, App-Intro, Formular, Modals, Intake-Chat, Fehlermeldungen).  
- Neue UI-Strings immer dort ergänzen, damit niemand versehentlich technische Werte rendert.

---

## 4. Fehler- & UX-Richtlinien

| Bereich | Regel |
| --- | --- |
| Error UX | `services/api.js` mappt HTTP-Status auf freundliche Meldungen (`uiStrings.errors`). |
| Success UX | Nur menschliche Texte & Buttons; keine IDs, Roh-URLs oder Booleans im UI. |
| Intake-Chat | `status.message` wird als „Nächste Frage“ angezeigt; `assistant_reply` enthält höchstens 1–2 Sätze. |
| Download | Always-on Blob-Download mit Dateiname `DIY-Report.pdf`. Keine `window.location`-Sprünge mehr. |

---

## 5. Tests & Backlog

- **Tests**: (offen) React Testing Library für Formularflow, E2E (Playwright/Cypress).  
- **Accessibility**: Fokuszustände vorhanden, aber noch nicht automatisiert geprüft.  
- **State**: Aktuell lokal in `App.jsx`; bei weiteren Features ggf. Context/State Machine.  
- **Design System**: Buttons/Cards liegen in `globals.css`; bei neuen Patterns bitte dort ergänzen.

---

## 6. Weitere Dokumente

- [`docs/FRONTEND_IMPLEMENTATION_GUIDE.md`](../docs/FRONTEND_IMPLEMENTATION_GUIDE.md) – Detail-Guide zu Komponenten, Datenfluss und Styling.  
- [`docs/README_FULLSTACK.md`](../docs/README_FULLSTACK.md) – Architektur & Betrieb (Frontend <-> Backend).  
- [`docs/IMPLEMENTATION_SUMMARY.md`](../docs/IMPLEMENTATION_SUMMARY.md) – Historie wichtiger Änderungen (z. B. WeasyPrint, UI-Strings).  
- [`README.md`](../README.md) – Globales Projektmanual & Navigationshilfe.

Bei Fragen rund um UX oder das Intake-Interface immer zuerst in den Frontend-Guide schauen – dort stehen auch offene Backlog-Punkte.
