'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const providers = [
  {
    name: 'Amazon Logistics',
    theme: { bg: '#232F3E', text: '#FFFFFF', border: '#FF9900' },
  },
  {
    name: 'AliExpress Global',
    theme: { bg: '#FF6A00', text: '#FFFFFF', border: '#B50000' },
  },
  {
    name: 'DHL Express',
    theme: { bg: '#FFCC00', text: '#1C1C1C', border: '#D40511' },
  },
  {
    name: 'Custom n8n Connector',
    theme: { bg: '#1D1D1D', text: '#6CE5E8', border: '#FF61F6' },
  },
];

export default function RunPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [provider, setProvider] = useState(providers[0].name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentTheme = providers.find((p) => p.name === provider)?.theme ?? providers[0].theme;

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
        body: JSON.stringify({ trackingNumber, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start tracking.');
      }

      const data = await response.json();
      router.push(`/executions/${data.executionId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An unknown error occurred.');
      } else {
        setError('An unknown error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">ChainTrack AI</p>
          <h1 className="mt-2 text-3xl font-bold text-indigo-700">Launch Live Tracking</h1>
          <p className="mt-2 text-sm text-gray-500">Real-time supply chain automation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Data Source
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="mt-1 block w-full rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundColor: currentTheme.bg,
                color: currentTheme.text,
                border: `2px solid ${currentTheme.border}`,
              }}
            >
              {providers.map(({ name }) => (
                <option key={name} value={name} className="text-black">
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Dropdown colors match each marketplace so demos highlight connector swaps instantly.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Starting Pipeline…' : 'Track Shipment'}
          </button>
        </form>
      </div>
    </div>
  );
}