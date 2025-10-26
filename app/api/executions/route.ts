import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trackingNumber } = body;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const newExecution = await prisma.execution.create({
      data: {
        trackingNumber: trackingNumber,
        status: 'PENDING',
      },
    });


    const executionId = newExecution.id;

    const n8nHost = process.env.N8N_HOST;

    if (!n8nHost) {

        console.warn('N8N_HOST environment variable not set. Workflow trigger skipped.');
    } else {

        const webhookPath = "a51dc2d7-8e51-46a0-afd5-0966dd16324b"; 
        
        const webhookUrl = `${n8nHost}/webhook/${webhookPath}`; 
        

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trackingNumber: trackingNumber,
                executionId: executionId,
            }),
        }).catch((e) => {
            console.error('Failed to trigger n8n workflow:', e.message);
        });
    }

    return NextResponse.json({ executionId: newExecution.id });
  } catch (error) {
    console.error('Failed to create execution:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}