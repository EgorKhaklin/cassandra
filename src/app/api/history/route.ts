// National-rollup history ring buffer (last ~10 minutes).

import { NextResponse } from 'next/server';
import { getSimulation } from '@/engine/simulation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sim = getSimulation();
  return NextResponse.json({ history: sim.getHistory() });
}
