export type ResponseController = {
    enqueue: (chunk: string) => void;
    close: () => void;
};

const activeControllers = new Map<string, ResponseController>();

export function addController(executionId: string, controller: ResponseController) {
    activeControllers.set(executionId, controller);
    console.log(`[SSE Broker] Added connection for: ${executionId}. Total active: ${activeControllers.size}`);
}

export function removeController(executionId: string) {
    activeControllers.delete(executionId);
    console.log(`[SSE Broker] Removed connection for: ${executionId}. Total active: ${activeControllers.size}`);
}

export function publishEvent(executionId: string, data: any) {
    const controller = activeControllers.get(executionId);

    if (controller) {
        const eventString = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(eventString);
        console.log(`[SSE Broker] Published event to ${executionId}: ${data.message}`);
        return true;
    } else {
        console.warn(`[SSE Broker] No active connection found for ${executionId}.`);
        return false;
    }
}