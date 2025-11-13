import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateDIYReport = async (data) => {
  try {
    const response = await api.post('/api/generate', data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Fehler beim Erstellen der Anleitung. Bitte versuchen Sie es erneut.'
    );
  }
};

export const downloadPDF = (fileId) => {
  window.open(`${API_BASE}/api/download/${fileId}`, '_blank');
};

export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;

