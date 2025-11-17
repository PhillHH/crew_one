import clsx from 'clsx';
import uiStrings from '../../uiStrings';

const EXAMPLES = [
  'Eine Wand mit dunkler Tapete tapezieren (15 m²)',
  'Alte Holzkommode abschleifen und neu lackieren',
  'Schwimmendes Bücherregal montieren',
  'Fliesenspiegel in der Küche austauschen',
];

export default function ProjectDescriptionStep({ register, errors, watch, setValue }) {
  const description = watch('projectDescription');
  const { project } = uiStrings.projectForm.steps;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          {project.fieldLabel}
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {project.fieldDescription}
        </p>
        <textarea
          {...register('projectDescription')}
          rows={6}
          className="input-field resize-none"
          placeholder={project.placeholder}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>
            {description?.length || 0} / 2000 {project.charCountSuffix}
          </span>
          {errors.projectDescription && (
            <span className="text-red-500">{errors.projectDescription.message}</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {project.examplesTitle}
        </h3>
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
