// app/executions/[id]/page.tsx
'use client';
import { useExecutionEvents } from '@/lib/useExecutionEvents';
import { CheckCircle, Clock, XCircle, Zap } from 'lucide-react';

interface ExecutionPageProps {
  params: { id: string };
}
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'PROCESSING':
      return <Zap className="w-6 h-6 text-indigo-500 animate-pulse" />;
    case 'FAILED':
      return <XCircle className="w-6 h-6 text-red-500" />;
    case 'PENDING':
    default:
      return <Clock className="w-6 h-6 text-yellow-500" />;
  }
};