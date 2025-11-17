import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, RefreshCw, Send } from 'lucide-react';

import {
  DIYRequirement,
  DIYRequirementDraft,
  IntakeChatStatus,
  IntakeResult,
  IntakeTurn,
} from '../../types/intake';
import { finalizeIntake, streamIntakeChat } from '../../services/intake';
import { formatRequirementSummary } from '../../utils/intake';
import uiStrings from '../../uiStrings';

type IntakeChatProps = {
  onComplete: (result: IntakeResult) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onPrefill: (requirement: DIYRequirement) => void;
};

export default function IntakeChat({
  onComplete,
  onError,
  onLoadingChange,
  onPrefill,
}: IntakeChatProps) {
  const [history, setHistory] = useState<IntakeTurn[]>([
    { role: 'assistant', content: uiStrings.intakeChat.initialAssistant },
  ]);
  const [draft, setDraft] = useState<DIYRequirementDraft | null>(null);
  const [status, setStatus] = useState<IntakeChatStatus>({});
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [proposal, setProposal] = useState<DIYRequirement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const latestDraftRef = useRef<DIYRequirementDraft | null>(null);
  const { intakeChat } = uiStrings;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, streamingMessage]);

  const LABELS: Record<string, string> = {
    project_goal: 'Projektziel',
    current_state: 'Ausgangslage',
    dimensions: 'Maße/Fläche',
    surface_details: 'Oberfläche/Untergrund',
    materials: 'Material/Stil',
    finish_preference: 'Finish/Look',
    environment: 'Einsatzort',
    indoor_outdoor: 'Indoor/Outdoor',
    style_reference: 'Stilreferenz',
    tools_available: 'Vorhandene Werkzeuge',
    skill_level: 'Erfahrungslevel',
    experience_notes: 'Zusatz zur Erfahrung',
    budget: 'Budgetrahmen',
    timeline: 'Zeitplan',
    special_considerations: 'Besondere Hinweise',
  };

  const requirementEntries = useMemo(() => {
    if (!draft) return [];
    return Object.entries(draft)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const label = LABELS[key] ?? key;
        if (Array.isArray(value)) {
          return [label, value.join(', ')];
        }
        return [label, value];
      });
  }, [draft]);

  const handleFinalize = useCallback(
    async (requirement: DIYRequirementDraft | null) => {
      if (!requirement || isFinalizing) {
        if (!requirement) {
          onError(uiStrings.errors.noRequirementAvailable);
        }
        return;
      }
      try {
        setIsFinalizing(true);
        onLoadingChange?.(true);
        const response = await finalizeIntake(requirement);
        onComplete({
          requirement: response.requirement,
          response: response.result,
        });
      } catch (error) {
        console.error(error);
        onError((error as Error).message || uiStrings.errors.intakeFinalize);
      } finally {
        setIsFinalizing(false);
        onLoadingChange?.(false);
      }
    },
    [isFinalizing, onComplete, onError, onLoadingChange]
  );

  const handleStatus = useCallback(
    (incomingStatus: IntakeChatStatus) => {
      setStatus(incomingStatus);

      if (incomingStatus.requirement) {
        setProposal(incomingStatus.requirement);
      } else if (!incomingStatus.is_complete) {
        setProposal(null);
      }
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const nextHistory = [...history, { role: 'user', content: input.trim() }];
    setHistory(nextHistory);
    setInput('');
    setStreamingMessage('');
    setIsStreaming(true);
    setProposal(null);

    let accumulated = '';
    try {
      await streamIntakeChat(
        {
          history: nextHistory,
          requirement_snapshot: draft ?? undefined,
        },
        {
          onMessage: (delta) => {
            accumulated += delta;
            setStreamingMessage(accumulated);
          },
          onDraft: (snapshot) => {
            setDraft(snapshot);
            latestDraftRef.current = snapshot;
          },
          onStatus: handleStatus,
          onError: (detail) => {
            throw new Error(detail);
          },
        }
      );

      const finalized = accumulated.trim();
      if (finalized) {
        setHistory((prev) => [...prev, { role: 'assistant', content: finalized }]);
      }
    } catch (error) {
      console.error(error);
      onError((error as Error).message || uiStrings.errors.intakeStreaming);
    } finally {
      setStreamingMessage('');
      setIsStreaming(false);
    }
  }, [draft, handleStatus, history, input, isStreaming, onError]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setHistory([{ role: 'assistant', content: intakeChat.initialAssistant }]);
    setDraft(null);
    setStatus({});
    setStreamingMessage('');
    setProposal(null);
    latestDraftRef.current = null;
  };

  const handlePrefill = () => {
    if (!proposal) return;
    onPrefill(proposal);
  };

  const summary = useMemo(
    () => (proposal ? formatRequirementSummary(proposal) : ''),
    [proposal]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {intakeChat.title}
          </h3>
          <p className="text-gray-500">
            {intakeChat.subtitle}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary flex items-center gap-2"
          onClick={handleReset}
          disabled={isStreaming || isFinalizing}
        >
          <RefreshCw className="w-4 h-4" />
          {intakeChat.resetButton}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1" ref={listRef}>
            {history.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={`flex ${
                  turn.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${
                    turn.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {turn.content}
                </div>
              </div>
            ))}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm bg-gray-100 text-gray-800">
                  {streamingMessage}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="relative">
              <textarea
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                placeholder={intakeChat.inputPlaceholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={isStreaming || isFinalizing}
              />
              <button
                type="button"
                className="absolute right-3 bottom-3 bg-indigo-600 text-white rounded-full p-2 disabled:bg-gray-300"
                onClick={handleSend}
                disabled={isStreaming || isFinalizing || !input.trim()}
              >
                {isStreaming ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {status.missing_fields && status.missing_fields.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {intakeChat.openFieldsLabel} Einige Angaben fehlen noch.
              </p>
            )}
            {status.message && !status.is_complete && (
              <p className="text-xs text-gray-400 mt-1">
                {intakeChat.nextQuestionLabel} {status.message}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{intakeChat.draftTitle}</h4>
            <p className="text-sm text-gray-500">
              {intakeChat.draftSubtitle}
            </p>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {requirementEntries.length === 0 && (
              <p className="text-sm text-gray-500">{intakeChat.draftEmpty}</p>
            )}
            {requirementEntries.map(([key, value]) => (
              <div key={key} className="border border-gray-100 rounded-xl px-3 py-2">
                <p className="text-xs uppercase text-gray-400">{key}</p>
                <p className="text-sm text-gray-800">{value as string}</p>
              </div>
            ))}
          </div>

          {proposal && (
            <div className="space-y-3 border border-indigo-100 rounded-xl bg-indigo-50 px-4 py-3">
              <p className="text-sm font-semibold text-indigo-900">Vorgeschlagene Anforderung</p>
              <textarea
                className="w-full text-sm text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg p-3 resize-none"
                value={summary}
                readOnly
                rows={8}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary flex-1 min-w-[180px]"
                  onClick={handlePrefill}
                  disabled={isFinalizing}
                >
                  In Formular übernehmen
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1 min-w-[180px]"
                  disabled={isFinalizing}
                  onClick={() => setProposal(null)}
                >
                  Weiter verfeinern
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1 min-w-[180px] border border-emerald-300 text-emerald-700"
                  onClick={() => handleFinalize(latestDraftRef.current)}
                  disabled={isFinalizing}
                >
                  {isFinalizing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird erstellt...
                    </span>
                  ) : (
                    'Direkt PDF erstellen'
                  )}
                </button>
              </div>
            </div>
          )}

          {status.is_complete && !proposal && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm text-emerald-700 font-medium">
                Alle Pflichtfelder vorhanden – Vorschlag folgt gleich.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


