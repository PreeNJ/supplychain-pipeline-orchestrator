export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const executionId = params.id;
  console.log(`SSE connection opened for executionId: ${executionId}`);

  const stream = new ReadableStream({
    start(controller) {
      // We will connect this to a message broker in Week 2.
      controller.enqueue(`data: {"message": "Connection established. Waiting for updates..."}\n\n`);