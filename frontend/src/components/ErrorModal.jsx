import { AlertTriangle } from 'lucide-react';

export default function ErrorModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops, da ist etwas schief gelaufen!</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
