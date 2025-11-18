import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import uiStrings from '../uiStrings';

export default function LoadingModal({ isOpen }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = uiStrings.loading.mainMessages;

  useEffect(() => {
    if (!isOpen) return;
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, messages.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 md:p-10 max-w-lg w-full text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {uiStrings.loading.title}
        </h2>
        <p className="text-lg text-gray-600 min-h-[60px] transition-opacity">
          {messages[messageIndex]}
        </p>
        <p className="text-sm text-gray-400 mt-6">
          {uiStrings.loading.hint}
        </p>
      </div>
    </div>
  );
}
