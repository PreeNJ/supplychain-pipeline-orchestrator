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

    return NextResponse.json({ executionId: newExecution.id });
  } catch (error) {
    console.error('Failed to create execution:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}