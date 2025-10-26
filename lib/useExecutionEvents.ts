import { useState, useEffect } from 'react';
import { useEventSource } from 'use-eventsource-hook';

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

  const eventSourceUrl = `/api/executions/${executionId}/events`;

  const {
    eventSource,
    connectionState,
    lastMessage,
    error
  } = useEventSource(eventSourceUrl, {
      closeOnMessage: (message) => {
        try {
          const data = JSON.parse(message.data);
          return data.status === 'COMPLETED'; // Close stream when automation is done
        } catch {
          return false;
        }
      }
  });

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        setStatus(data.status);
        setEvents((prev) => [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }]);

        if (data.aiSummary) {
            setAiSummary(data.aiSummary);
        }
      } catch (e) {
        console.error('Error parsing SSE message:', e);
      }
    }
  }, [lastMessage]);


  return {
    status,
    events,
    aiSummary,
    connectionState,
    error,
  };
};