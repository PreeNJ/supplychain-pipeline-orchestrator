import ExecutionLive from './ExecutionLive';
import { use } from 'react';

interface ExecutionPageProps {
  params: Promise<{ id: string }>;
}

export default function ExecutionPage({ params }: ExecutionPageProps) {
  const resolvedParams = use(params);
  return <ExecutionLive executionId={resolvedParams.id} />;
}