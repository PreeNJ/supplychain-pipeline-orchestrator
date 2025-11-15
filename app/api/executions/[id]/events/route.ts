import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  console.log(`SSE connection opened for id: ${id}`);

  const stream = new ReadableStream({
    async start(controller) {
      try {

        const execution = await prisma.execution.findUnique({
          where: { id: id },
          include: { events: { orderBy: { createdAt: 'desc' } } },
        });

        if (!execution) {
          controller.enqueue(`data: ${JSON.stringify({ error: "Execution not found", status: "FAILED" })}\n\n`);
          controller.close();
          return;
        }

        controller.enqueue(`data: ${JSON.stringify({
          status: execution.status,
          aiSummary: execution.aiSummary,
          message: execution.events[0]?.message || "Execution started",
          timestamp: new Date().toISOString()
        })}\n\n`);

        const interval = setInterval(async () => {
          try {
            const updated = await prisma.execution.findUnique({
              where: { id: id },
              include: { events: { orderBy: { createdAt: 'desc' }, take: 1 } },
            });

            if (updated) {
              const eventData = {
                status: updated.status,
                aiSummary: updated.aiSummary,
                message: updated.events[0]?.message || "Processing...",
                timestamp: new Date().toISOString()
              };
              
              controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);

              if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
                clearInterval(interval);
                controller.close();
              }
            }
          } catch (error) {
            console.error('Error fetching execution update:', error);
          }
        }, 2000);

        request.signal.onabort = () => {
          console.log(`SSE connection closed for id: ${id}`);
          clearInterval(interval);
          controller.close();
        };
      } catch (error) {
        console.error('Error in SSE route:', error);
        controller.enqueue(`data: ${JSON.stringify({ error: "Server error", status: "FAILED" })}\n\n`);
        controller.close();
      }
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