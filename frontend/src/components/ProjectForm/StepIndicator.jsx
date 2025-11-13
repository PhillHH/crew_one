import clsx from 'clsx';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={step.id}
            className="flex items-center gap-3"
          >
            <div
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                {
                  'bg-primary text-white shadow-lg shadow-purple-200': isActive,
                  'bg-green-500 text-white shadow-lg shadow-green-200': isCompleted,
                  'bg-gray-200 text-gray-500': !isActive && !isCompleted,
                }
              )}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="min-w-[120px]">
              <p className={clsx('text-sm font-medium', {
                'text-primary': isActive,
                'text-gray-500': !isActive,
              })}
              >
                {step.label}
              </p>
              <p className="text-xs text-gray-400 hidden md:block">
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block w-10 h-px bg-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
}
