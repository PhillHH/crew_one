import { useEffect, useRef, useState } from 'react';
import Hero from './components/Hero';
import ProjectForm from './components/ProjectForm';
import LoadingModal from './components/LoadingModal';
import SuccessModal from './components/SuccessModal';
import ErrorModal from './components/ErrorModal';
import { generateDIYReport, downloadPDF } from './services/api';
import { transformFormData } from './utils/validation';

function App() {
  const formSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (successData?.pdf_url && successData?.file_id) {
      downloadPDF(successData.file_id);
    }
  }, [successData]);

  const handleStart = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessData(null);

      const requestPayload = transformFormData(formData);
      const response = await generateDIYReport(requestPayload);
      setSuccessData(response);
    } catch (error) {
      setErrorMessage(error.message || 'Unbekannter Fehler. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (fileId) => {
    if (!fileId) return;
    downloadPDF(fileId);
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero onStart={handleStart} />

      <main ref={formSectionRef} className="container mx-auto px-6 py-12 md:py-16">
        <ProjectForm onSubmit={handleSubmit} />
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
