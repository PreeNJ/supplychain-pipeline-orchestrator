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

        {/* Event Timeline */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pipeline Activity Log</h2>
        <div className="space-y-4">
          {events.slice().reverse().map((event, index) => (
            <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
              <div className="flex-shrink-0 pt-1">
                  <StatusIcon status={event.status} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                <p className="text-base font-medium text-gray-700">{event.message}</p>
                {event.aiSummary && <p className="text-xs text-indigo-600 mt-1">[AI Summary Captured]</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/run" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Start New Tracking
          </a>
        </div>
      </div>
    </div>
  );
}