import clsx from 'clsx';
import { Controller } from 'react-hook-form';
import { Sprout, Hammer, ShieldCheck } from 'lucide-react';

const OPTIONS = [
  {
    value: 'beginner',
    label: 'Anfänger:in',
    description: 'Ich starte gerade erst und brauche ausführliche Erklärungen',
    icon: Sprout,
  },
  {
    value: 'experienced',
    label: 'Erfahren',
    description: 'Ich habe schon ein paar DIY-Projekte umgesetzt',
    icon: Hammer,
  },
  {
    value: 'professional',
    label: 'Profi',
    description: 'Ich habe handwerkliche Ausbildung oder sehr viel Erfahrung',
    icon: ShieldCheck,
  },
];

export default function ExperienceStep({ control, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Wie viel DIY-Erfahrung hast du?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Dein Erfahrungslevel beeinflusst die Detailtiefe der Anleitung, Tipps und Sicherheitshinweise.
        </p>
      </div>

      <Controller
        name="experienceLevel"
        control={control}
        render={({ field }) => (
          <div className="grid gap-4 md:grid-cols-3">
            {OPTIONS.map(({ value, label, description, icon: Icon }) => {
              const isSelected = field.value === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={clsx(
                    'card border transition text-left w-full',
                    isSelected
                      ? 'border-primary shadow-lg shadow-purple-100'
                      : 'border-transparent hover:border-gray-200'
                  )}
                  onClick={() => field.onChange(value)}
                  onBlur={field.onBlur}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={isSelected}
                    onChange={() => field.onChange(value)}
                    className="sr-only"
                  />
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx('p-3 rounded-full', {
                          'bg-primary text-white': isSelected,
                          'bg-gray-100 text-gray-600': !isSelected,
                        })}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-800">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      />

      {errors.experienceLevel && (
        <p className="text-sm text-red-500">{errors.experienceLevel.message}</p>
      )}
    </div>
  );
}
