import { CheckCircle2, Download, Mail, Headphones } from 'lucide-react';

export default function SuccessModal({ isOpen, data, onClose, onDownload }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Deine Anleitung ist fertig! 🎉
          </h2>
          <p className="text-gray-600 mt-3">
            Du kannst sie jetzt herunterladen oder in deinem Postfach abrufen.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {data?.pdf_url && (
            <button
              type="button"
              onClick={() => onDownload(data.file_id)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              PDF herunterladen
            </button>
          )}

          {data?.email_sent && (
            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
              <Mail className="w-5 h-5" />
              Deine Anleitung wurde an deine E-Mail-Adresse gesendet.
            </div>
          )}

          {data?.support_request_id && (
            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <Headphones className="w-5 h-5" />
              Support-Anfrage erstellt – ID: <strong>{data.support_request_id}</strong>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full mt-6"
        >
          Neues Projekt starten
        </button>
      </div>
    </div>
  );
}
