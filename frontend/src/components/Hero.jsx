import { Sparkles, Wrench, ShieldCheck } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <section className="bg-gradient-to-r from-primary via-purple-700 to-accent text-white py-20">
      <div className="container mx-auto px-6 text-center max-w-5xl">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            KI-gestützte DIY-Anleitungen in Minuten
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            Plane dein Do-it-yourself Projekt mit persönlicher PDF-Anleitung
          </h1>
          <p className="text-lg md:text-xl text-white/90 mt-6">
            Beschreibe dein Projekt, wähle dein Erfahrungslevel und erhalte eine
            individuelle Anleitung inklusive Einkaufsliste, Sicherheitshinweisen und optionalem Support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-yellow-200" />}
            title="Individuelle Anleitung"
            description="Deine Projektbeschreibung wird von unserem CrewAI-System in eine maßgeschneiderte Schritt-für-Schritt-Anleitung verwandelt."
          />
          <FeatureCard
            icon={<Wrench className="w-8 h-8 text-yellow-200" />}
            title="Kompletter Werkzeug-Guide"
            description="Erhalte eine Einkaufsliste mit Werkzeugen und Materialien sowie Profi-Tipps passend zu deinem Erfahrungslevel."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-yellow-200" />}
            title="Optionale Expertenhilfe"
            description="Buche Telefon- oder Vor-Ort-Support. In Hamburg vermitteln wir Handwerker:innen oder Auszubildende, die dich begleiten."
          />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="btn-primary text-lg px-10 py-4"
        >
          Projekt starten
        </button>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card bg-white/10 backdrop-blur border border-white/10 min-h-[220px]">
      <div className="flex items-center gap-4 mb-4 text-white">
        <div className="p-3 bg-white/10 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-white/80 leading-relaxed">{description}</p>
    </div>
  );
}
