// One-shot snapshot endpoint — useful for first paint and SSR-friendly fallback.

import { NextResponse } from 'next/server';
import { getSimulation } from '@/engine/simulation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sim = getSimulation();
  const { snap, national, news, alerts } = sim.getSnapshot();
  return NextResponse.json({ snap, national, news, alerts });
}
