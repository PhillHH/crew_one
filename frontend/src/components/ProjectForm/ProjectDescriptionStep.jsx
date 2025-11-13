import clsx from 'clsx';

const EXAMPLES = [
  'Eine Wand mit dunkler Tapete tapezieren (15 m²)',
  'Alte Holzkommode abschleifen und neu lackieren',
  'Schwimmendes Bücherregal montieren',
  'Fliesenspiegel in der Küche austauschen',
];

export default function ProjectDescriptionStep({ register, errors, watch, setValue }) {
  const description = watch('projectDescription');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Beschreibe dein Projekt
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Je genauer du dein Vorhaben beschreibst, desto präziser wird deine Anleitung.
          Erwähne Maße, Materialien oder besondere Herausforderungen.
        </p>
        <textarea
          {...register('projectDescription')}
          rows={6}
          className="input-field resize-none"
          placeholder="Beispiel: Ich möchte in meinem Wohnzimmer eine 3,5 m breite Wand mit einer dunkelroten englischen Papiertapete tapezieren. Die Wand ist 2,5 m hoch. Ich habe schon einmal tapeziert, bin mir aber unsicher bei Rapporten und Untergrundvorbereitung."
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{description?.length || 0} / 2000 Zeichen</span>
          {errors.projectDescription && (
            <span className="text-red-500">{errors.projectDescription.message}</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Schnellstart-Beispiele</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setValue('projectDescription', example, { shouldValidate: true })}
              className={clsx(
                'px-4 py-2 rounded-full border text-sm transition',
                description === example
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
