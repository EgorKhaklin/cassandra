'use client';

import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/Card';
import { CODE_TO_STATE } from '@/data/states';
import { fmtDelta, fmtTimeShort, issueLabel } from '@/lib/format';
import { leanColor } from '@/lib/color-scale';

export function NewsFeed() {
  const news = useAppStore(s => s.news);
  const setSelected = useAppStore(s => s.setSelected);

  return (
    <Card title="News stream" badge={`${news.length}`} badgeColor="#7f8a9c">
      {news.length === 0 ? (
        <p className="text-2xs text-slate-600 font-mono">awaiting news…</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {news.slice(0, 14).map(n => (
            <li
              key={n.id}
              className="cursor-pointer hover:bg-slate-800/30 px-1.5 py-1 rounded-sm border border-transparent hover:border-slate-800"
              onClick={() => {
                const code = n.affectedStates[0];
                if (code) setSelected(code);
              }}
            >
              <div className="flex items-center gap-2 text-2xs font-mono text-slate-500">
                <span>{fmtTimeShort(n.ts)}</span>
                <span>·</span>
                <span className="uppercase">{n.source}</span>
                <span>·</span>
                <span className="uppercase">{issueLabel(n.issue)}</span>
                <span
                  className="ml-auto px-1 rounded-sm border"
                  style={{
                    color: leanColor(n.sentimentImpact * 20, 80),
                    borderColor: leanColor(n.sentimentImpact * 20, 80),
                  }}
                >
                  {fmtDelta(n.sentimentImpact)}
                </span>
              </div>
              <div className="text-xs text-ivory leading-snug mt-0.5">{n.headline}</div>
              <div className="text-2xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                {n.affectedStates.map(c => {
                  const meta = CODE_TO_STATE[c];
                  return (
                    <span key={c} className="text-gold-dim font-mono">
                      [{meta?.code ?? c}]
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
