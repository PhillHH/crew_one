import { useEffect, useRef, useState } from 'react';
import Hero from './components/Hero';
import ProjectForm from './components/ProjectForm';
import LoadingModal from './components/LoadingModal';
import SuccessModal from './components/SuccessModal';
import ErrorModal from './components/ErrorModal';
import { generateDIYReport, downloadPDF, mapDIYResponseToViewModel } from './services/api';
import { transformFormData } from './utils/validation';
import IntakeChat from './components/IntakeChat/IntakeChat';
import { mapRequirementToFormData } from './utils/intake';
import uiStrings from './uiStrings';

function App() {
  const formSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState('manual');
  const [prefilledData, setPrefilledData] = useState(null);

  const handleStart = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessData(null);

      const requestPayload = transformFormData(formData);
      const viewModel = await generateDIYReport(requestPayload);
      setSuccessData(viewModel);
      setPrefilledData(null);
    } catch (error) {
      setErrorMessage(error.message || uiStrings.errors.generic);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!successData?.fileId) return;
    try {
      await downloadPDF(successData.fileId);
    } catch (error) {
      setErrorMessage(error.message || uiStrings.errors.generic);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMessage('');
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setErrorMessage('');
    setSuccessData(null);
  };

  const handleIntakeComplete = ({ response }) => {
    const viewModel = mapDIYResponseToViewModel(response);
    setSuccessData(viewModel);
  };

  const handleRequirementPrefill = (description) => {
    setPrefilledData({ projectDescription: description });
    setMode('manual');
    setErrorMessage('');
    setSuccessData(null);
  };

  const handleIntakeError = (message) => {
    setErrorMessage(message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero onStart={handleStart} />

      <main ref={formSectionRef} className="container mx-auto px-6 py-12 md:py-16">
        <section className="max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              {uiStrings.app.sectionLabel}
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 mt-2">
              {uiStrings.app.sectionTitle}
            </h2>
            <p className="text-gray-500 mt-1">
              {uiStrings.app.sectionSubtitle}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <label
                className={`border rounded-2xl p-4 cursor-pointer transition ${
                  mode === 'manual' ? 'border-indigo-500 shadow-md' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="sr-only"
                  checked={mode === 'manual'}
                  onChange={() => handleModeChange('manual')}
                />
                <p className="text-lg font-semibold text-gray-800">
                  {uiStrings.app.modeManualTitle}
                </p>
                <p className="text-sm text-gray-500">
                  {uiStrings.app.modeManualDescription}
                </p>
              </label>

              <label
                className={`border rounded-2xl p-4 cursor-pointer transition ${
                  mode === 'intake' ? 'border-indigo-500 shadow-md' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="sr-only"
                  checked={mode === 'intake'}
                  onChange={() => handleModeChange('intake')}
                />
                <p className="text-lg font-semibold text-gray-800">
                  {uiStrings.app.modeIntakeTitle}
                </p>
                <p className="text-sm text-gray-500">
                  {uiStrings.app.modeIntakeDescription}
                </p>
              </label>
            </div>
          </div>
        </section>

        {mode === 'manual' ? (
          <ProjectForm onSubmit={handleSubmit} prefilledData={prefilledData} />
        ) : (
          <IntakeChat
            onComplete={handleIntakeComplete}
            onError={handleIntakeError}
            onLoadingChange={setIsLoading}
            onPrefill={handleRequirementPrefill}
          />
        )}
      </main>

      <LoadingModal isOpen={isLoading} />
      <SuccessModal
        isOpen={!!successData}
        data={successData}
        onClose={handleReset}
        onDownload={handleDownload}
      />
      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage}
        onClose={handleReset}
      />
    </div>
  );
}

export default App;
