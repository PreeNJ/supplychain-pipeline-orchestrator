import { prisma } from '@/lib/db';
import { addController, removeController } from '@/lib/sse'; // <-- Import broker functions

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`SSE connection opened for id: ${id}`);

  const stream = new ReadableStream({
    async start(controller) {

      addController(id, controller);

      try {
        const execution = await prisma.execution.findUnique({
          where: { id: id },
          include: { events: { orderBy: { createdAt: 'asc' } } },
        });

        if (!execution) {
          controller.enqueue(`data: ${JSON.stringify({ error: "Execution not found", status: "FAILED" })}\n\n`);
          controller.close();
          return;
        } 

        for (const event of execution.events) {
          controller.enqueue(`data: ${JSON.stringify({
            status: execution.status,
            aiSummary: execution.aiSummary,
            message: event.message,
            eventType: event.eventType || 'INFO',
            timestamp: event.createdAt.toISOString()
          })}\n\n`);
        }

        if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
          removeController(id);
          controller.close();
        }

      } catch (error) {
        console.error('Error in SSE route initial load:', error);
        controller.enqueue(`data: ${JSON.stringify({ error: "Server error", status: "FAILED" })}\n\n`);
        removeController(id);
        controller.close();
      }

      request.signal.onabort = () => {
        console.log(`SSE connection closed for id: ${id}`);
        removeController(id);
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}