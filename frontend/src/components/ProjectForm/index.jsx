import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import StepIndicator from './StepIndicator';
import ProjectDescriptionStep from './ProjectDescriptionStep';
import ExperienceStep from './ExperienceStep';
import DeliveryStep from './DeliveryStep';
import SupportStep from './SupportStep';
import ContactStep from './ContactStep';
import { diyFormSchema } from '../../utils/validation';

const DEFAULT_VALUES = {
  projectDescription: '',
  experienceLevel: 'beginner',
  deliveryDownload: true,
  deliveryEmail: false,
  phoneSupport: false,
  onsiteSupport: false,
  location: '',
  name: '',
  email: '',
  phone: '',
};

const STEP_FIELDS = [
  ['projectDescription'],
  ['experienceLevel'],
  ['deliveryDownload', 'deliveryEmail'],
  ['phoneSupport', 'onsiteSupport', 'location'],
  ['name', 'email', 'phone'],
];

export default function ProjectForm({ onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(diyFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    reValidateMode: 'onBlur',
  });

  const steps = useMemo(() => ([
    {
      id: 'project',
      label: 'Projekt',
      description: 'Was möchtest du umsetzen?',
      component: (
        <ProjectDescriptionStep
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
      ),
    },
    {
      id: 'experience',
      label: 'Erfahrung',
      description: 'Wie sicher fühlst du dich?',
      component: (
        <ExperienceStep
          control={control}
          errors={errors}
        />
      ),
    },
    {
      id: 'delivery',
      label: 'Zustellung',
      description: 'Wie sollen wir liefern?',
      component: (
        <DeliveryStep
          register={register}
          errors={errors}
          watch={watch}
        />
      ),
    },
    {
      id: 'support',
      label: 'Support',
      description: 'Zusätzliche Unterstützung?',
      component: (
        <SupportStep
          control={control}
          register={register}
          errors={errors}
          watch={watch}
        />
      ),
    },
    {
      id: 'contact',
      label: 'Kontakt',
      description: 'Wie erreichen wir dich?',
      component: (
        <ContactStep
          register={register}
          errors={errors}
        />
      ),
    },
  ]), [errors, register, setValue, watch]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const isStepValid = await trigger(fieldsToValidate, { shouldFocus: true });
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    reset(DEFAULT_VALUES);
    setCurrentStep(0);
  };

  const submit = handleSubmit(async (data) => {
    await onSubmit(data);
    handleReset();
  });

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <header className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Erzähle uns von deinem Projekt
          </h2>
          <p className="text-gray-500">
            In wenigen Schritten zur maßgeschneiderten DIY-Anleitung – inklusive Einkaufsliste und Sicherheits-Check.
          </p>
        </header>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <form onSubmit={submit} className="space-y-8">
          <div>{steps[currentStep].component}</div>

          <div className="flex flex-col md:flex-row gap-4 justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrev}
              className="btn-secondary flex items-center justify-center gap-2 md:w-auto"
              disabled={isFirstStep || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>

            <div className="flex-1" />

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center justify-center gap-2 md:w-auto"
                disabled={isSubmitting}
              >
                Weiter <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird gesendet ...' : (<><Check className="w-5 h-5" /> Anleitung erstellen</>)}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
