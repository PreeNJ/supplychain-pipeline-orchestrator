import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { simulateExecutionFlow } from '@/lib/mockExecutionFlow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trackingNumber } = body;

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 });
    }

    const newExecution = await prisma.execution.create({
      data: {
        trackingNumber: trackingNumber,
        status: 'PENDING',
      },
    });

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber,
          executionId: newExecution.id,
        }),
      }).catch(e => console.error('Failed to trigger n8n workflow:', e));
    } else {
      simulateExecutionFlow(newExecution.id);
    }

    return NextResponse.json({ executionId: newExecution.id });
  } catch (error) {
    console.error('Failed to create execution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}