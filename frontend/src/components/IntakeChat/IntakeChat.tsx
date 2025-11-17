import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, Send } from 'lucide-react';

import { IntakeTurn } from '../../types/intake';
import { streamIntakeChat } from '../../services/intake';
import uiStrings from '../../uiStrings';

type IntakeChatProps = {
  onError: (message: string) => void;
  onPrefill: (description: string) => void;
};

export default function IntakeChat({
  onError,
  onPrefill,
}: IntakeChatProps) {
  const [history, setHistory] = useState<IntakeTurn[]>([
    { role: 'assistant', content: uiStrings.intakeChat.initialAssistant },
  ]);
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const { intakeChat } = uiStrings;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, streamingMessage]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const nextHistory = [...history, { role: 'user', content: input.trim() }];
    setHistory(nextHistory);
    setInput('');
    setStreamingMessage('');
    setIsStreaming(true);
    setIsFinished(false);

    let accumulated = '';
    try {
      await streamIntakeChat(
        { history: nextHistory },
        {
          onMessage: (delta) => {
            accumulated += delta;
            setStreamingMessage(accumulated);
          },
          onStatus: (status) => {
            if (status.is_complete) {
              setIsFinished(true);
            }
          },
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
  }, [history, isStreaming, onError]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setHistory([{ role: 'assistant', content: intakeChat.initialAssistant }]);
    setStreamingMessage('');
    setIsFinished(false);
  };

  const handlePrefill = () => {
    const lastAssistantMessage = [...history].reverse().find(
      (turn) => turn.role === 'assistant'
    );
    if (lastAssistantMessage) {
      onPrefill(lastAssistantMessage.content);
    }
  };

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
          disabled={isStreaming}
        >
          <RefreshCw className="w-4 h-4" />
          {intakeChat.resetButton}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={listRef}>
          {history.map((turn, index) => (
            <div
              key={`${turn.role}-${index}`}
              className={`flex ${
                turn.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] whitespace-pre-wrap ${
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
          {isFinished && (
            <div className="p-3 mb-3 text-center bg-emerald-50 rounded-2xl text-emerald-800 text-sm">
              <p className='font-medium'>{intakeChat.summaryComplete}</p>
              <p className='text-xs mt-1'>{intakeChat.summaryCompleteHint}</p>
              <button
                type='button'
                className='mt-3 btn-primary'
                onClick={handlePrefill}
              >
                {intakeChat.prefillButton}
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              placeholder={intakeChat.inputPlaceholder}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={isStreaming || isFinished}
            />
            <button
              type="button"
              className="absolute right-3 bottom-3 bg-indigo-600 text-white rounded-full p-2 disabled:bg-gray-300"
              onClick={handleSend}
              disabled={isStreaming || !input.trim() || isFinished}
            >
              {isStreaming ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


