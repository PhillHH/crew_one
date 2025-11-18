import clsx from 'clsx';
import { Controller } from 'react-hook-form';
import { Phone, MapPin, Users } from 'lucide-react';

export default function SupportStep({ control, register, watch, errors }) {
  const phoneSupport = watch('phoneSupport');
  const onsiteSupport = watch('onsiteSupport');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Möchtest du zusätzliche Unterstützung buchen?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Unser DIY-Team bietet telefonische Begleitung oder Vor-Ort-Support in Hamburg an.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="phoneSupport"
          control={control}
          render={({ field }) => (
            <SupportOption
              label="Telefonischer Support"
              description="Wir begleiten dich telefonisch während deines Projekts – Schritt für Schritt."
              icon={Phone}
              checked={field.value}
              onToggle={() => field.onChange(!field.value)}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="onsiteSupport"
          control={control}
          render={({ field }) => (
            <SupportOption
              label="Vor-Ort-Support (Hamburg)"
              description="Profis oder Auszubildende kommen für ca. 1 Stunde bei dir vorbei."
              icon={Users}
              checked={field.value}
              onToggle={() => field.onChange(!field.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      {(phoneSupport || onsiteSupport) && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">So funktioniert der Support:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Wir melden uns innerhalb eines Werktags mit Terminvorschlägen.</li>
              <li>Telefon-Support: flexibel nach Absprache.</li>
              <li>Vor-Ort-Support: aktuell verfügbar in Hamburg und Umgebung.</li>
            </ul>
          </div>
        </div>
      )}

      {onsiteSupport && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            In welcher Stadt / welchem Stadtteil befindest du dich?
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="Beispiel: Hamburg, Eimsbüttel"
            className="input-field"
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SupportOption({ label, description, icon: Icon, checked, onToggle, onBlur }) {
  return (
    <button
      type="button"
      className={clsx(
        'card border transition flex items-start gap-4 text-left w-full',
        checked ? 'border-primary shadow-lg shadow-purple-100' : 'border-gray-200 hover:border-primary/60'
      )}
      onClick={() => onToggle()}
      onBlur={onBlur}
      aria-pressed={checked}
    >
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 text-primary focus:ring-primary pointer-events-none"
        checked={checked}
        readOnly
        tabIndex={-1}
      />
      <div>
        <div className="flex items-center gap-2">
          <div className={clsx('p-2 rounded-full', {
            'bg-primary text-white': checked,
            'bg-gray-100 text-gray-600': !checked,
          })}
          >
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </button>
  );
}
