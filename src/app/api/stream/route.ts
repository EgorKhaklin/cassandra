// SSE endpoint: multiplexes sentiment ticks, news, alerts, and heartbeats.

import { NextRequest } from 'next/server';
import { getSimulation } from '@/engine/simulation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const sim = getSimulation();

  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // controller closed
        }
      };

      // Initial comment line some browsers want to flush the connection.
      controller.enqueue(encoder.encode(': cassandra stream open\n\n'));

      unsubscribe = sim.subscribe(send);
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
