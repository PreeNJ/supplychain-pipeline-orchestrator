export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const executionId = params.id;
  console.log(`SSE connection opened for executionId: ${executionId}`);

  const stream = new ReadableStream({
    start(controller) {

      controller.enqueue(`data: {"message": "Connection established. Waiting for updates..."}\n\n`);

      request.signal.onabort = () => {
        console.log(`SSE connection closed for executionId: ${executionId}`);
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