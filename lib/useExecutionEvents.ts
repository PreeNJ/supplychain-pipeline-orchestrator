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