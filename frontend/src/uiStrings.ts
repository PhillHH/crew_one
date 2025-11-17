export const uiStrings = {
  hero: {
    badgeLabel: 'KI-gestützte DIY-Anleitungen in Minuten',
    title: 'Plane dein Do-it-yourself Projekt mit persönlicher PDF-Anleitung',
    subtitle:
      'Beschreibe dein Projekt, wähle dein Erfahrungslevel und erhalte eine individuelle Anleitung inklusive Einkaufsliste, Sicherheitshinweisen und optionalem Support.',
    feature1Title: 'Individuelle Anleitung',
    feature1Description:
      'Deine Projektbeschreibung wird von unserem CrewAI-System in eine maßgeschneiderte Schritt-für-Schritt-Anleitung verwandelt.',
    feature2Title: 'Kompletter Werkzeug-Guide',
    feature2Description:
      'Erhalte eine Einkaufsliste mit Werkzeugen und Materialien sowie Profi-Tipps passend zu deinem Erfahrungslevel.',
    feature3Title: 'Optionale Expertenhilfe',
    feature3Description:
      'Buche Telefon- oder Vor-Ort-Support. In Hamburg vermitteln wir Handwerker:innen oder Auszubildende, die dich begleiten.',
    startButton: 'Projekt starten',
  },
  app: {
    sectionLabel: 'Projektstart',
    sectionTitle: 'Wie möchtest du dein DIY-Projekt beschreiben?',
    sectionSubtitle:
      'Du kannst entweder das bewährte Formular nutzen oder dir vom Intake-Agenten helfen lassen.',
    modeManualTitle: 'Ich weiß genau, was ich will',
    modeManualDescription:
      'Klassischer Formularablauf mit allen Optionen für Lieferung & Support.',
    modeIntakeTitle: 'Ich brauche Hilfe bei der Spezifizierung',
    modeIntakeDescription:
      'AI-Projektberater stellt Rückfragen und erstellt automatisch die finale Anfrage.',
  },
  loading: {
    title: 'Deine Anleitung wird erstellt',
    mainMessages: [
      '🤖 KI erstellt deine Anleitung ...',
      '📝 Sicherheitshinweise werden zusammengestellt ...',
      '🛒 Einkaufsliste wird optimiert ...',
      '✨ PDF wird finalisiert ...',
    ],
    hint: 'Dieser Vorgang dauert in der Regel weniger als eine Minute.',
  },
  successModal: {
    title: 'Deine Anleitung ist fertig! 🎉',
    body: 'Du kannst sie jetzt herunterladen oder in deinem Postfach abrufen.',
    downloadButton: 'PDF herunterladen',
    emailInfo: 'Deine Anleitung wurde an deine E-Mail-Adresse gesendet.',
    supportInfoPrefix: 'Support-Anfrage wurde erstellt.',
    newProjectButton: 'Neues Projekt starten',
  },
  errorModal: {
    title: 'Oops, da ist etwas schief gelaufen!',
    retryButton: 'Erneut versuchen',
  },
  errors: {
    generic: 'Unbekannter Fehler. Bitte versuche es erneut.',
    network: 'Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.',
    server: 'Der Server konnte deine Anfrage nicht verarbeiten. Bitte versuche es später erneut.',
    validation: 'Bitte überprüfe deine Eingaben und korrigiere markierte Felder.',
    intakeStreaming: 'Streaming fehlgeschlagen. Bitte versuche es erneut oder wechsle zum Formular.',
    intakeFinalize: 'Finalisierung fehlgeschlagen. Bitte versuche es erneut.',
    noRequirementAvailable: 'Keine vollständige Anforderung verfügbar.',
    diyGenerationFailed: 'Fehler beim Erstellen der Anleitung. Bitte versuche es erneut.',
  },
  projectForm: {
    headerTitle: 'Erzähle uns von deinem Projekt',
    headerSubtitle:
      'In wenigen Schritten zur maßgeschneiderten DIY-Anleitung – inklusive Einkaufsliste und Sicherheits-Check.',
    backButton: 'Zurück',
    nextButton: 'Weiter',
    submitLabel: 'Anleitung erstellen',
    submitLoading: 'Wird gesendet ...',
    steps: {
      project: {
        label: 'Projekt',
        description: 'Was möchtest du umsetzen?',
        fieldLabel: 'Beschreibe dein Projekt',
        fieldDescription:
          'Je genauer du dein Vorhaben beschreibst, desto präziser wird deine Anleitung. Erwähne Maße, Materialien oder besondere Herausforderungen.',
        placeholder:
          'Beispiel: Ich möchte in meinem Wohnzimmer eine 3,5 m breite Wand mit einer dunkelroten englischen Papiertapete tapezieren. Die Wand ist 2,5 m hoch. Ich habe schon einmal tapeziert, bin mir aber unsicher bei Rapporten und Untergrundvorbereitung.',
        examplesTitle: 'Schnellstart-Beispiele',
        charCountSuffix: 'Zeichen',
      },
      experience: {
        label: 'Erfahrung',
        description: 'Wie sicher fühlst du dich?',
      },
      delivery: {
        label: 'Zustellung',
        description: 'Wie sollen wir liefern?',
      },
      support: {
        label: 'Support',
        description: 'Zusätzliche Unterstützung?',
      },
      contact: {
        label: 'Kontakt',
        description: 'Wie erreichen wir dich?',
        contactIntro:
          'Wir senden dir deine Anleitung per E-Mail und kontaktieren dich bei Rückfragen zu Support-Leistungen.',
        nameLabel: 'Name',
        namePlaceholder: 'Max Mustermann',
        emailLabel: 'E-Mail-Adresse',
        emailPlaceholder: 'max.mustermann@example.com',
        phoneLabel: 'Telefonnummer',
        phonePlaceholder: '+49 151 12345678',
        phoneHint:
          'Format: +49..., 0049... oder 0... (nur Ziffern, keine Sonderzeichen)',
      },
    },
  },
  intakeChat: {
    initialAssistant:
      'Hallo! Ich helfe dir, dein DIY-Projekt zu spezifizieren. Erzähle mir kurz, was du vorhast.',
    title: 'AI Intake-Chat',
    subtitle:
      'Der Projektberater sammelt alle Details, bevor deine Anleitung erstellt wird.',
    resetButton: 'Neustart',
    inputPlaceholder: 'Beschreibe dein Projekt oder stelle eine Frage...',
    openFieldsLabel: 'Offene Felder:',
    nextQuestionLabel: 'Nächste Frage:',
    draftTitle: 'Anforderungs-Entwurf',
    draftSubtitle:
      'Live-Überblick über alle Informationen, die der Agent gesammelt hat.',
    draftEmpty: 'Noch keine Details vorhanden.',
    proposalTitle: 'Vorgeschlagene Anforderung',
    proposalToFormButton: 'In Formular übernehmen',
    proposalRefineButton: 'Weiter verfeinern',
    finalizeButton: 'Direkt PDF erstellen',
    finalizingLabel: 'Wird erstellt...',
    completeInfo: 'Alle Pflichtfelder vorhanden – Vorschlag folgt gleich.',
  },
};

export default uiStrings;



