export default function DeliveryStep({ register, watch, errors }) {
  const download = watch('deliveryDownload');
  const email = watch('deliveryEmail');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Wie möchtest du deine Anleitung erhalten?
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Du kannst deine Anleitung sofort herunterladen und zusätzlich eine E-Mail erhalten.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-4 card border border-gray-200">
          <input
            type="checkbox"
            {...register('deliveryDownload')}
            className="mt-1 h-5 w-5 text-primary focus:ring-primary"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Direkter PDF-Download</h3>
            <p className="text-sm text-gray-500">
              Du erhältst nach Abschluss sofort einen Download-Link.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 card border border-gray-200">
          <input
            type="checkbox"
            {...register('deliveryEmail')}
            className="mt-1 h-5 w-5 text-primary focus:ring-primary"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Per E-Mail zustellen</h3>
            <p className="text-sm text-gray-500">
              Deine Anleitung wird zusätzlich an deine E-Mail-Adresse gesendet.
            </p>
          </div>
        </label>
      </div>

      {!download && !email && (
        <p className="text-sm text-red-500">
          {errors.deliveryDownload?.message || 'Bitte wähle mindestens eine Option aus.'}
        </p>
      )}
    </div>
  );
}
