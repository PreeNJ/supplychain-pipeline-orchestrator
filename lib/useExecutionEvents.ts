import { useState, useEffect, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface ExecutionEvent {
  message: string;
  status: string;
  timestamp: string;
  aiSummary?: string;
}

export const useExecutionEvents = (executionId: string) => {
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [status, setStatus] = useState('PENDING');
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'OPEN' | 'CLOSED'>('CONNECTING');
  const [error, setError] = useState<string | null>(null);

  const eventSourceUrl = `/api/executions/${executionId}/events`;

  useEffect(() => {
    if (!executionId) return;

    const eventSource = new EventSource(eventSourceUrl);
    
    eventSource.onopen = () => {
      setConnectionState('OPEN');
      setError(null);
    };

    eventSource.onerror = (e) => {
      console.error("EventSource Error:", e);
      setError("Connection failed. Check n8n/Ngrok/Server.");
      setConnectionState('CLOSED');
      eventSource.close();
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        setStatus(data.status);
        setEvents((prev) => [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }]);

        if (data.aiSummary) {
            setAiSummary(data.aiSummary);
        }

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            setConnectionState('CLOSED');
            eventSource.close();
        }
      } catch (e) {
        console.error('Error parsing SSE message:', e);
        setError("Error processing data stream.");
      }
    };

    return () => {
      setConnectionState('CLOSED');
      eventSource.close();
    };

  }, [executionId, eventSourceUrl]);


  return {
    status,
    events,
    aiSummary,
    connectionState,
    error,
  };
};