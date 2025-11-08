import { NextResponse } from 'next/server';
import { publishEvent } from '@/lib/sse';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { executionId, message, status, aiSummary } = body;

    if (!executionId || !message) {
      return NextResponse.json(
        { error: 'Missing executionId or message in callback.' },
        { status: 400 }
      );
    }

    await prisma.execution.update({
        where: { id: executionId },
        data: { 
            status: status, 
            aiSummary: aiSummary || undefined 
        },
    });

    await prisma.executionEvent.create({
        data: {
            executionId: executionId,
            message: message,
        },
    });

    const dataToPublish = {
        message,
        status,
        timestamp: new Date().toISOString(),
        aiSummary: aiSummary || null,
    };

    const published = publishEvent(executionId, dataToPublish);

    return NextResponse.json(
      { 
        success: true, 
        publishedToClient: published,
        dbUpdated: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing n8n callback:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during callback processing' },
      { status: 500 }
    );
  }
}