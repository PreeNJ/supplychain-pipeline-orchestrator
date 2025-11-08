import ExecutionLive from './ExecutionLive';

interface ExecutionPageProps {
  params: { id: string };
}

export default function ExecutionPage({ params }: ExecutionPageProps) {
  const executionId = params.id;
  
return <ExecutionLive executionId={executionId} />;
}