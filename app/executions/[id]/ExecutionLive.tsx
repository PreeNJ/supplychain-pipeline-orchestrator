'use client'; 

import { useExecutionEvents } from '@/lib/useExecutionEvents';
import { CheckCircle, Clock, XCircle, Zap, Package, Truck, Warehouse, MapPin } from 'lucide-react';
import React from 'react'; 

interface ExecutionLiveProps {
  executionId: string;
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

const EventIcon = ({ eventType }: { eventType?: string }) => {
  const iconClass = "w-5 h-5";
  
  switch (eventType) {
    case 'LABEL_CREATED':
      return <Zap className={`${iconClass} text-blue-500`} />;
    case 'PICKED_UP':
      return <Package className={`${iconClass} text-green-500`} />;
    case 'IN_TRANSIT':
      return <Truck className={`${iconClass} text-indigo-500`} />;
    case 'ARRIVED_AT_HUB':
      return <Warehouse className={`${iconClass} text-purple-500`} />;
    case 'OUT_FOR_DELIVERY':
      return <Truck className={`${iconClass} text-orange-500`} />;
    case 'DELIVERED':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case 'EXCEPTION':
      return <XCircle className={`${iconClass} text-red-500`} />;
    default:
      return <MapPin className={`${iconClass} text-gray-500`} />;
  }
};

export default function ExecutionLive({ executionId }: ExecutionLiveProps) {
  const { status, events, aiSummary, connectionState } = useExecutionEvents(executionId);

  const isProcessing = status === 'PROCESSING'; 

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">Live Shipment Orchestrator</h1>
        <p className="text-sm text-gray-500 mb-6">Execution ID: {executionId}</p>

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

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pipeline Activity Log</h2>
        <div className="space-y-4">
          {events.slice().reverse().map((event, index) => (
            <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center pt-1">
                <EventIcon eventType={event.eventType} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-base font-semibold text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500" suppressHydrationWarning>
                    {typeof window !== 'undefined' 
                      ? new Date(event.timestamp).toLocaleTimeString()
                      : ''}
                  </p>
                </div>
                {event.aiSummary && (
                  <p className="text-xs text-indigo-600 mt-1 italic">
                    AI: {event.aiSummary}
                  </p>
                )}
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