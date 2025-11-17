import axios from 'axios';
import uiStrings from '../uiStrings';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mapAxiosErrorToMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (status === 422) {
      if (Array.isArray(detail)) {
        const msg = detail.map((d) => d.msg).join(', ');
        return msg || uiStrings.errors.validation;
      }
      if (typeof detail === 'string') {
        return detail;
      }
      return uiStrings.errors.validation;
    }

    if (status >= 500) {
      return detail || uiStrings.errors.server;
    }

    if (status >= 400) {
      return detail || uiStrings.errors.validation;
    }
  } else if (error.request) {
    return uiStrings.errors.network;
  }

  return uiStrings.errors.generic;
};

export const mapDIYResponseToViewModel = (data) => ({
  success: !!data?.success,
  message: data?.message || '',
  canDownload: !!data?.pdf_url,
  canEmail: !!data?.email_sent,
  fileId: data?.file_id || null,
  hasSupportRequest: !!data?.support_request_id,
});

export const generateDIYReport = async (data) => {
  try {
    const response = await api.post('/api/generate', data);
    return mapDIYResponseToViewModel(response.data);
  } catch (error) {
    const message = mapAxiosErrorToMessage(error);
    throw new Error(message);
  }
};

export const downloadPDF = async (fileId) => {
  if (!fileId) {
    throw new Error(uiStrings.errors.generic);
  }

  try {
    const response = await fetch(`${API_BASE}/api/download/${fileId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(uiStrings.errors.server);
      }
      throw new Error(uiStrings.errors.generic);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'DIY-Report.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(uiStrings.errors.generic);
  }
};

export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;

