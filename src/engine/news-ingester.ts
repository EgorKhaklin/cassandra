// News ingester. In sim mode, picks templates and instantiates news items
// targeted at random states (weighted by intensity). Live mode would replace
// pickTemplate() with an adapter pulling GDELT / RSS feeds.

import { NEWS_TEMPLATES, type NewsTemplate } from '@/data/news-seed';
import { STATES, CODE_TO_STATE } from '@/data/states';
import type { NewsItem, StateSentiment } from '@/lib/types';
import { makeGaussian, pick } from '@/lib/rng';

let id = 1;

function nextId(prefix = 'N'): string {
  return `${prefix}-${Date.now().toString(36)}-${(id++).toString(36)}`;
}

export interface NewsImpulse {
  item: NewsItem;
  leanPush: number;
  intensityPush: number;
}

/** Generate a news impulse for one tick of the news cycle. */
export function generateNews(
  snap: Record<string, StateSentiment>,
  rng: () => number,
  now = Date.now(),
): NewsImpulse {
  const tmpl: NewsTemplate = pick(NEWS_TEMPLATES, rng);

  // Choose 1–3 affected states, weighted by intensity (busier states attract more news).
  const codes = STATES.map(s => s.code);
  const weights = codes.map(c => snap[c]?.intensity ?? 50);
  const wSum = weights.reduce((a, b) => a + b, 0);

  const pickWeighted = (): string => {
    let r = rng() * wSum;
    for (let i = 0; i < codes.length; i++) {
      r -= weights[i];
      if (r <= 0) return codes[i];
    }
    return codes[codes.length - 1];
  };

  const nAffected = 1 + Math.floor(rng() * 2.99); // 1..3
  const affected = new Set<string>();
  while (affected.size < nAffected) affected.add(pickWeighted());
  const affectedStates = [...affected];

  const stateName = CODE_TO_STATE[affectedStates[0]]?.name ?? affectedStates[0];

  // Signed impact: template mean direction (R+/D-) modulated by Gaussian.
  const gauss = makeGaussian(rng);
  const directionSign = tmpl.swingTowards === 'R' ? 1 : tmpl.swingTowards === 'D' ? -1 : (rng() > 0.5 ? 1 : -1);
  const leanPushMag = Math.max(0, tmpl.meanImpact + gauss() * tmpl.stddevImpact);
  const leanPush = leanPushMag * directionSign;

  const intensityPush = Math.max(0, tmpl.intensityMean + gauss() * 3);

  const item: NewsItem = {
    id: nextId('N'),
    ts: now,
    source: tmpl.source,
    headline: tmpl.headline.replace(/%S/g, stateName),
    summary: tmpl.summary.replace(/%S/g, stateName),
    affectedStates,
    sentimentImpact: leanPush,
    intensityImpact: intensityPush,
    issue: tmpl.issue,
    confidence: 'MED',
  };

  return { item, leanPush, intensityPush };
}
