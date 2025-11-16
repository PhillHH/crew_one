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
| HTTP | axios | Wrapper-Funktionen in `src/services/api.js` |

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
│   └── styles/globals.css
└── README.md (projektbezogenes Setup)
```

## 3. Datenfluss

1. `Hero` scrollt den Nutzer zum Formular (`handleStart` in `App.jsx`).
2. `ProjectForm` verwaltet den Stepper, ruft bei Submit `onSubmit` aus `App.jsx` auf.
3. `transformFormData` (Zod) mappt UI-Felder auf das Backend-Schema.
4. `generateDIYReport` sendet den Request, `LoadingModal` blockiert währenddessen.
5. `SuccessModal` bietet Download + Statushinweise, `ErrorModal` deckt `catch`-Branches ab.

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

```1:46:frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

export const downloadPDF = (fileId) => {
  window.location.href = `/api/download/${fileId}`; // TODO: auf fetch/Blob umstellen
};
```

- Fehlerbehandlung: axios wirft Exceptions, die bis `App.jsx` durchgereicht werden. Für granularere UX (z. B. Validation vs. Server Down) können wir `error.response?.status` auswerten.

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
| State Mgmt | Lokal in `App.jsx` | Bei Skalierung (mehr Features) erwägen: Zustand in Context oder Zustandmaschine |
| Error UX | Generischer Text | Differenzierte Meldungen (z. B. Validation vs. Timeout), Retry-Buttons |
| i18n | Strings hardcodiert | Strings kapseln (z. B. simple Dictionary) |

## 9. Zusammenarbeit mit Backend & CrewAI

- Schema-Vertrag: `frontend/src/utils/validation.js` ↔ `backend/models/schemas.py`. Änderungen immer beidseitig pflegen.
- `SuccessModal` erwartet Felder `pdf_url`, `file_id`, `email_sent`, `support_request_id` – diese werden im Backend erzeugt (`DIYResponse`).
- PDF-Downloads: Während `downloadPDF()` derzeit `window.location` nutzt, kann perspektivisch ein Streaming-Download mit Progressbar nachgerüstet werden.

## 10. Ressourcen & weitere Doku

- `docs/README_FULLSTACK.md` – Gesamtarchitektur, Betriebsprozesse
- `frontend/README.md` – Kurzreferenz (Setup, Befehle, Env)
- `docs/IMPLEMENTATION_SUMMARY.md` – Historie größerer Änderungen
- `architektur.md` – Ordnerstruktur und Duplikatbereinigung

> **Hinweis:** Bitte Inline-Kommentare in Code-Beispielen beibehalten/ergänzen, sobald komplexere Logik entsteht – das erleichtert künftige Übernahmen.

