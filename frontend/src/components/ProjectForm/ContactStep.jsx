import uiStrings from '../../uiStrings';

export default function ContactStep({ register, errors }) {
  const { contact } = uiStrings.projectForm.steps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          {contact.label}
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {contact.contactIntro}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {contact.nameLabel}
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder={contact.namePlaceholder}
            className="input-field"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {contact.emailLabel}
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder={contact.emailPlaceholder}
            className="input-field"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {contact.phoneLabel}
          </label>
          <input
            type="tel"
            {...register('phone')}
            placeholder={contact.phonePlaceholder}
            className="input-field"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {contact.phoneHint}
          </p>
        </div>
      </div>
    </div>
  );
}
