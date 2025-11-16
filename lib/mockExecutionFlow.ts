import { prisma } from '@/lib/db';
import { publishEvent } from '@/lib/sse';

interface MockStep {
  simulatedMinutes: number;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
  eventType?: string;
  aiSummary?: string;
}

const MINUTE_IN_MS = 60_000;
const timeCompression = Math.max(1, Number(process.env.MOCK_TIME_COMPRESSION ?? '5'));

const mockSteps: MockStep[] = [
  {
    simulatedMinutes: 15,
    message: 'Shipment registered with carrier',
    status: 'PROCESSING',
    eventType: 'LABEL_CREATED',
  },
  {
    simulatedMinutes: 120,
    message: 'Package picked up from origin facility',
    status: 'PROCESSING',
    eventType: 'PICKED_UP',
  },
  {
    simulatedMinutes: 360,
    message: 'Departed origin hub and en route to regional hub',
    status: 'PROCESSING',
    eventType: 'IN_TRANSIT',
  },
  {
    simulatedMinutes: 720,
    message: 'Arrived at regional distribution hub',
    status: 'PROCESSING',
    eventType: 'ARRIVED_AT_HUB',
  },
  {
    simulatedMinutes: 300,
    message: 'Out for delivery to final destination',
    status: 'PROCESSING',
    eventType: 'OUT_FOR_DELIVERY',
  },
  {
    simulatedMinutes: 180,
    message: 'Shipment delivered and signed for',
    status: 'COMPLETED',
    eventType: 'DELIVERED',
    aiSummary: 'Carrier confirmed successful delivery. No outstanding actions.',
  },
];

const activeMockRuns = new Set<string>();

const computeDelayMs = (simulatedMinutes: number) => {
  return Math.max(500, Math.round((simulatedMinutes * MINUTE_IN_MS) / timeCompression));
};

export function simulateExecutionFlow(executionId: string) {
  if (activeMockRuns.has(executionId)) {
    return;
  }

  activeMockRuns.add(executionId);

  let cumulativeDelay = 0;

  mockSteps.forEach((step, index) => {
    const stepDelay = computeDelayMs(step.simulatedMinutes);
    cumulativeDelay += stepDelay;

    setTimeout(async () => {
      try {
        const updatedExecution = await prisma.execution.update({
          where: { id: executionId },
          data: {
            status: step.status,
            aiSummary: step.aiSummary ?? undefined,
          },
        });

        const event = await prisma.executionEvent.create({
          data: {
            executionId,
            message: step.message,
            eventType: step.eventType ?? 'INFO',
          },
        });

        publishEvent(executionId, {
          message: event.message,
          eventType: event.eventType,
          status: step.status,
          aiSummary: updatedExecution.aiSummary,
          timestamp: event.createdAt.toISOString(),
        });
      } catch (error) {
        console.error('[MockExecutionFlow] Failed to apply step', { executionId, index, error });
      } finally {
        if (index === mockSteps.length - 1) {
          activeMockRuns.delete(executionId);
        }
      }
    }, cumulativeDelay);
  });
}
