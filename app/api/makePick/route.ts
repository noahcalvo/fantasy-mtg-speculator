import { Worker } from 'worker_threads';

let timerMap = new Map<number, NodeJS.Timeout>();

// Start a worker thread to run the draft function
async function startDraftWorker(draftId: number, set: string, playerId?: number, cardName?: string) {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: { draftId, set, playerId, cardName } });
    worker.on('message', (message: any) => {
      console.log('Worker sent message:', message);
      if (message === 'done') {
        resolve();
      }
    });
    worker.on('error', (error: Error) => {
      reject(error);
    });
    worker.on('exit', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

// Modified POST function to initiate auto-drafting
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const { draftId, playerId, cardName, set } = data;
    if (timerMap.has(draftId)) {
      clearTimeout(timerMap.get(draftId));
    }

    // Start auto-drafting for subsequent picks using a worker thread
    await startDraftWorker(draftId, set, playerId, cardName);

    // Return a response to indicate the process has started
    console.error("returning response");
    return new Response(JSON.stringify({
      message: "Drafting process initiated",
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      message: err || "An error occurred",
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}