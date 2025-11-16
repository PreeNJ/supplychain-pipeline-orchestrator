import ExecutionLive from './ExecutionLive';

interface ExecutionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExecutionPage({ params }: ExecutionPageProps) {
  const { id } = await params;
  return <ExecutionLive executionId={id} />;
}