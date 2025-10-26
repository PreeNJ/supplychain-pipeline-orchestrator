// app/run/page.tsx
'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RunPage() {
    const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();