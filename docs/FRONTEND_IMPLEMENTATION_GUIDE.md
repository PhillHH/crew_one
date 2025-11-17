# Frontend Implementation Guide

## 1. Ziel & Überblick

Dieses Dokument beschreibt die aktuelle Implementierung des React-Frontends sowie offene Arbeiten für Skalierung und Produktivbetrieb.  
Der Code befindet sich vollständig unter `frontend/`.

## 2. Stack & Projektstruktur

| Bereich | Technologie | Hinweise |
| --- | --- | --- |
| Build | Vite + Node 20 | schnelle Dev-Iteration, ESM |
| Framework | React 18, Hooks | ausschließlich Funktionskomponenten |
| Styling | Tailwind CSS + `globals.css` | Utility-First, zentrale Button/Card-Klassen |
| Form | react-hook-form + Zod | Schema lebt in `src/utils/validation.js` |
| HTTP | axios + Fetch | `services/api.js` (Formular/ViewModel) & `services/intake.ts` (SSE) |
| Texte | `uiStrings.ts` | Zentrale deutsche Strings für Hero, Form, Intake, Modals, Fehler |

```
frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── ProjectForm/
│   │   │   ├── index.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── ...Steps.jsx
│   │   ├── LoadingModal.jsx
│   │   ├── SuccessModal.jsx
│   │   └── ErrorModal.jsx
│   ├── services/api.js
│   ├── utils/validation.js
│   ├── uiStrings.ts
│   └── styles/globals.css
└── README.md (projektbezogenes Setup)
```

## 3. Datenfluss

1. `Hero` scrollt den Nutzer zum Formular (`handleStart` in `App.jsx`).
2. `ProjectForm` verwaltet den Stepper, `transformFormData` mappt UI-Felder auf das Backend-Schema.
3. `generateDIYReport()` ruft `/api/generate` auf und liefert ein enttechnisiertes ViewModel (`{ message, canDownload, canEmail, fileId, hasSupportRequest }`).
4. `App.jsx` speichert dieses ViewModel, `LoadingModal` blockiert währenddessen, `SuccessModal`/`ErrorModal` zeigen nur Texte aus `uiStrings`.
5. `downloadPDF()` lädt per `fetch + blob()` und vergibt immer den Dateinamen `DIY-Report.pdf`.

```1:45:frontend/src/App.jsx
  const handleSubmit = async (formData) => {
  setIsLoading(true);            // aktiviert LoadingModal
  setErrorMessage('');
  setSuccessData(null);
  try {
    const payload = transformFormData(formData); // validiert + mappt Keys
    const response = await generateDIYReport(payload);
    setSuccessData(response);    // öffnet SuccessModal
  } catch (error) {
    setErrorMessage(error.message ?? 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  };
```

## 4. Formularlogik

- Steps werden in `ProjectForm/index.jsx` per `useMemo` definiert; `STEP_FIELDS` bestimmt, welche Felder pro Step validiert werden.
- `react-hook-form` + `zodResolver` liefert konsistente Fehlermeldungen; diese sollten in jedem Step unter den Feldern angezeigt werden.
- Telefon-Validierung nutzt deutsches Format (`PHONE_REGEX` in `validation.js`); Anpassungen erfolgen zentral dort.

## 5. Styling-Guidelines

- Tailwind-Klassen bilden das Grundgerüst. Wiederkehrende Pattern (Buttons, Cards) sind in `globals.css` zusammengefasst.
- Komponenten erhalten semantische Container (`section`, `main`, `button type="button"`), sodass Screenreader sauber navigieren können.
- Für Inline-Kommentare in Styles (`/* ... */`) dokumentieren wir besondere Regeln (z. B. `.btn-primary`).

```css
/* frontend/src/styles/globals.css */
.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-200 rounded-xl px-6 py-3 hover:bg-gray-50;
}
```

## 6. API-Layer

```ts
const api = axios.create({ baseURL: API_BASE });

export const mapDIYResponseToViewModel = (data) => ({
  success: !!data?.success,
  message: data?.message || '',
  canDownload: !!data?.pdf_url,
  canEmail: !!data?.email_sent,
  fileId: data?.file_id || null,
  hasSupportRequest: !!data?.support_request_id,
});

export const downloadPDF = async (fileId) => {
  const response = await fetch(`${API_BASE}/api/download/${fileId}`);
  const blob = await response.blob();
  // Blob → DIY-Report.pdf
};
```

- Fehlerbehandlung: `mapAxiosErrorToMessage()` wertet HTTP-Status (422/4xx/5xx) sowie Netzwerkfehler aus und liefert human-readable Texte aus `uiStrings.errors`.

## 7. Build- & Dev-Kommandos

```bash
npm install                 # Abhängigkeiten
npm run dev                 # HMR unter http://localhost:5173
npm run build               # Produktionsbundle (-> dist/)
npm run preview             # Vorschau des gebauten Bundles
# Tipp: VITE_API_URL im .env definieren, wenn Backend nicht auf 8000 läuft
```

Docker-Pipeline: siehe `frontend/Dockerfile` (Node-Build + Nginx). Für externe Deployments lediglich `dist/` auf statischen Hoster legen und API-Proxy konfigurieren.

## 8. Qualitätsmaßnahmen & Backlog

| Thema | Aktueller Stand | To-dos |
| --- | --- | --- |
| Tests | keine automatisierten Tests | React Testing Library (Formflow), Cypress/Playwright (E2E) |
| Accessibility | Fokusführungen vorhanden, aber nicht geprüft | ARIA-Labels, Tastaturnavigation testen |
| State Mgmt | Lokal in `App.jsx` | Bei Skalierung (mehr Features) ggf. Context oder Zustandmaschine |
| Error UX | Statuscode-Mapping + `uiStrings.errors` aktiv | Retry-Aktionen, Inline-Hinweise je Feld |
| i18n | Zentrales deutsches Dictionary (`uiStrings.ts`) | Mehrsprachigkeit vorbereiten |

## 9. Zusammenarbeit mit Backend & CrewAI

- Schema-Vertrag: `frontend/src/utils/validation.js` ↔ `backend/models/schemas.py`. Änderungen immer beidseitig pflegen.
- `generateDIYReport()` mappt den Backend-Response (`DIYResponse`) in ein ViewModel; `SuccessModal`/`ErrorModal` zeigen nur Texte aus `uiStrings`.
- PDF-Downloads laufen bereits über `fetch + blob()`; Dateiname: `DIY-Report.pdf`.

## 10. Ressourcen & weitere Doku

- `docs/README_FULLSTACK.md` – Gesamtarchitektur, Betriebsprozesse
- `frontend/README.md` – Kurzreferenz (Setup, Befehle, Env)
- `docs/IMPLEMENTATION_SUMMARY.md` – Historie größerer Änderungen
- `architektur.md` – Ordnerstruktur und Duplikatbereinigung

> **Hinweis:** Bitte Inline-Kommentare in Code-Beispielen beibehalten/ergänzen, sobald komplexere Logik entsteht – das erleichtert künftige Übernahmen.

