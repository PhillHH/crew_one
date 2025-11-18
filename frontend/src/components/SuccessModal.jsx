import { CheckCircle2, Download, Mail, Headphones } from 'lucide-react';
import uiStrings from '../uiStrings';

export default function SuccessModal({ isOpen, data, onClose, onDownload }) {
  if (!isOpen || !data) return null;

  const { successModal } = uiStrings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            {successModal.title}
          </h2>
          <p className="text-gray-600 mt-3">
            {data.message || successModal.body}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {data.canDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {successModal.downloadButton}
            </button>
          )}

          {data.canEmail && (
            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
              <Mail className="w-5 h-5" />
              {successModal.emailInfo}
            </div>
          )}

          {data.hasSupportRequest && (
            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <Headphones className="w-5 h-5" />
              {successModal.supportInfoPrefix}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full mt-6"
        >
          {successModal.newProjectButton}
        </button>
      </div>
    </div>
  );
}
