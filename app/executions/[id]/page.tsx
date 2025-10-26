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
export default function ExecutionPage({ params }: ExecutionPageProps) {
  const { id: executionId } = params;
  const { status, events, aiSummary, connectionState } = useExecutionEvents(executionId);
  
  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED';
  const isProcessing = status === 'PROCESSING';
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">Live Shipment Orchestrator</h1>
        <p className="text-sm text-gray-500 mb-6">Execution ID: {executionId}</p>
        
        {/* AI Summary Card (The Job Deliverable) */}
        <div className="mb-8 p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <StatusIcon status={status} />
            <h2 className="text-xl font-semibold text-indigo-800">
              Current Status: {status.toUpperCase()}
            </h2>
          </div>
          
          {aiSummary ? (
            <p className="mt-2 text-gray-800 font-medium">{aiSummary}</p>
          ) : (
            <p className="mt-2 text-gray-600 italic">
              AI analysis is running. Standby for the summarized status...
            </p>
          )}
          {connectionState === 'OPEN' && isProcessing && (
              <p className="text-sm text-indigo-500 mt-3 flex items-center">
                <Zap className="w-4 h-4 mr-1"/> Receiving live events...
              </p>
          )}
        </div>