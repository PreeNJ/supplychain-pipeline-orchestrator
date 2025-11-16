import { prisma } from '@/lib/db';
import { addController, removeController, ResponseController } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: executionId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let heartbeat: NodeJS.Timeout | null = null;
      let cleanedUp = false;
      let abortHandler: (() => void) | null = null;

      const closeStream = () => {
        try {
          controller.close();
        } catch (closeError) {
          console.warn('[SSE] Attempted to close already-closed stream', closeError);
        }
      };

      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        if (heartbeat) clearInterval(heartbeat);
        if (abortHandler) {
          request.signal.removeEventListener('abort', abortHandler);
          abortHandler = null;
        }
        removeController(executionId);
        closeStream();
      };

      const safeEnqueue = (chunk: string) => {
        if (cleanedUp) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch (error) {
          console.warn('[SSE] Failed to enqueue chunk, cleaning up stream', error);
          cleanup();
        }
      };

      const responseController: ResponseController = {
        enqueue: safeEnqueue,
        close: cleanup,
      };

      addController(executionId, responseController);

      try {
        const execution = await prisma.execution.findUnique({
          where: { id: executionId },
          include: { events: { orderBy: { createdAt: 'asc' } } },
        });

        if (cleanedUp) return;

        if (!execution) {
          safeEnqueue(`data: ${JSON.stringify({ error: 'Execution not found', status: 'FAILED' })}\n\n`);
          cleanup();
          return;
        }

        if (cleanedUp) return;

        safeEnqueue(
          `data: ${JSON.stringify({
            message: 'SSE_CONNECTED',
            status: execution.status,
            aiSummary: execution.aiSummary,
            timestamp: new Date().toISOString(),
          })}\n\n`
        );

        if (cleanedUp) return;

        for (const event of execution.events) {
          if (cleanedUp) return;
          safeEnqueue(
            `data: ${JSON.stringify({
              status: execution.status,
              aiSummary: execution.aiSummary,
              message: event.message,
              eventType: event.eventType || 'INFO',
              timestamp: event.createdAt.toISOString(),
            })}\n\n`
          );
        }

        if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
          cleanup();
          return;
        }
      } catch (error) {
        console.error('Error in SSE route initial load:', error);
        if (!cleanedUp) {
          safeEnqueue(`data: ${JSON.stringify({ error: 'Server error', status: 'FAILED' })}\n\n`);
          cleanup();
        }
        return;
      }

      heartbeat = setInterval(() => {
        safeEnqueue(
          `data: ${JSON.stringify({ message: 'HEARTBEAT', timestamp: new Date().toISOString() })}\n\n`
        );
      }, 30000);

      abortHandler = () => cleanup();
      request.signal.addEventListener('abort', abortHandler);
    },

    cancel() {
      removeController(executionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  });
}