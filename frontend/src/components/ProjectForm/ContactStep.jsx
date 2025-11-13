export default function ContactStep({ register, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Wie können wir dich erreichen?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Wir senden dir deine Anleitung per E-Mail und kontaktieren dich bei Rückfragen zu Support-Leistungen.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="Max Mustermann"
            className="input-field"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="max.mustermann@example.com"
            className="input-field"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefonnummer
          </label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+49 151 12345678"
            className="input-field"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Format: +49..., 0049... oder 0... (nur Ziffern, keine Sonderzeichen)
          </p>
        </div>
      </div>
    </div>
  );
}
