'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RunPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) {
      setError('Please enter a tracking number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start tracking.');
      }

      const data = await response.json();
      router.push(`/executions/${data.executionId}`);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700">ChainTrack AI</h1>
        <p className="text-center text-gray-500">Real-time Supply Chain Automation</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tracking" className="block text-sm font-medium text-gray-700">
              Tracking Number
            </label>
            <input
              id="tracking"
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Starting Pipeline...' : 'Track Shipment'}
          </button>
        </form>
      </div>
    </div>
  );
}