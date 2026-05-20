'use client';

import { useSentimentStream } from '@/hooks/useSentimentStream';

/** Mount once at the app root to connect the SSE stream into the store. */
export function StreamProvider() {
  useSentimentStream();
  return null;
}
