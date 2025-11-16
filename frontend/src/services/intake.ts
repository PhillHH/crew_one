import {
  DIYRequirementDraft,
  IntakeChatPayload,
  IntakeChatStatus,
  IntakeFinalizeResponse,
} from '../types/intake';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatStreamCallbacks {
  onMessage: (delta: string) => void;
  onDraft: (draft: DIYRequirementDraft) => void;
  onStatus: (status: IntakeChatStatus) => void;
  onError: (detail: string) => void;
}

export async function streamIntakeChat(
  payload: IntakeChatPayload,
  callbacks: ChatStreamCallbacks
): Promise<void> {
  const response = await fetch(`${API_BASE}/intake/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 422) {
    const detail = await response.json().catch(() => null);
    const message =
      detail?.detail?.map?.((d: { msg: string }) => d.msg).join(', ') ||
      'Eingabe unvollständig. Bitte Schritt wiederholen.';
    throw new Error(message);
  }

  if (!response.ok || !response.body) {
    throw new Error('Streaming konnte nicht gestartet werden.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (chunk.startsWith('data:')) {
        const payloadText = chunk.replace(/^data:\s*/, '');
        if (payloadText === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(payloadText);
          if (parsed.type === 'message') {
            callbacks.onMessage(parsed.delta ?? '');
          } else if (parsed.type === 'draft') {
            callbacks.onDraft((parsed.draft ?? {}) as DIYRequirementDraft);
          } else if (parsed.type === 'status') {
            callbacks.onStatus(parsed);
          } else if (parsed.type === 'error') {
            callbacks.onError(parsed.detail ?? 'Unbekannter Fehler im Stream.');
          }
        } catch (error) {
          console.warn('Konnte Streaming-Payload nicht lesen', error);
        }
      }

      boundary = buffer.indexOf('\n\n');
    }
  }
}

export async function finalizeIntake(
  draft: DIYRequirementDraft
): Promise<IntakeFinalizeResponse> {
  const response = await fetch(`${API_BASE}/intake/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requirement: draft }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail?.detail || 'Finalisierung fehlgeschlagen.');
  }

  return response.json();
}


