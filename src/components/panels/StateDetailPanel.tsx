'use client';

import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { CODE_TO_STATE } from '@/data/states';
import { ISSUES } from '@/data/issues';
import { fmtLean, fmtDelta, fmtNum, issueLabel, fmtTimeShort } from '@/lib/format';
import { leanColor } from '@/lib/color-scale';

export function StateDetailPanel() {
  const code = useAppStore(s => s.selectedCode);
  const s = useAppStore(state => code ? state.states[code] : null);
  const news = useAppStore(state => state.news);
  const meta = code ? CODE_TO_STATE[code] : null;

  if (!code || !s || !meta) {
    return (
      <Card title="State detail" badge="—" badgeColor="#3a4658">
        <p className="text-2xs text-slate-500 font-mono leading-relaxed">
          Click a state on the map to populate this panel.
          <br/><br/>
          <span className="text-slate-600">› hover</span> to preview · <span className="text-slate-600">› click</span> to commit
        </p>
      </Card>
    );
  }

  const dayDelta = s.history.length > 1 ? s.partisanLean - s.history[0] : 0;
  const linkedNews = news.filter(n => n.affectedStates.includes(code)).slice(0, 4);

  return (
    <Card title={`${meta.name} (${meta.code})`} badge={`${meta.ev} EV`} badgeColor="#d4a437">
      <div className="space-y-4">
        {/* Hero readout */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-sm border border-slate-700"
            style={{ background: leanColor(s.partisanLean, s.intensity) }}
            aria-hidden
          />
          <div className="flex-1">
            <div className="text-[28px] leading-none font-mono font-semibold text-ivory tabular-nums">
              {fmtLean(s.partisanLean)}
            </div>
            <div className="text-2xs text-slate-400 mt-1 flex items-center gap-2">
              <span>since open: <span className="text-ivory">{fmtDelta(dayDelta)}</span></span>
              <span>·</span>
              <ConfidenceBadge level={s.confidence} />
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs uppercase tracking-widest text-slate-500 font-mono">Lean trajectory</span>
            <span className="text-2xs text-slate-500 font-mono">{s.history.length} samples</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-2 py-1 rounded-sm">
            <Sparkline data={s.history} width={272} height={42} color="#d4a437" reference={meta.baselineLean} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Intensity" value={fmtNum(s.intensity, 0)} unit="" />
          <Stat label="Volatility" value={fmtNum(s.volatility, 0)} unit="σ" />
          <Stat label="Baseline" value={fmtLean(meta.baselineLean)} unit="" />
        </div>

        {/* Issue breakdown */}
        <div>
          <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">
            Issue salience
          </div>
          <ul className="space-y-1">
            {s.issues.slice().sort((a, b) => b.salience - a.salience).slice(0, 6).map(i => (
              <li key={i.issue} className="flex items-center gap-2 text-2xs font-mono">
                <span className="w-28 text-slate-300">{issueLabel(i.issue)}</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-sm overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(i.salience * 100).toFixed(1)}%`,
                      background: leanColor(i.lean, 80),
                    }}
                  />
                </div>
                <span className="w-12 text-right tabular-nums text-slate-400">{fmtLean(i.lean)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Linked news */}
        <div>
          <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">
            Linked news
          </div>
          {linkedNews.length === 0 ? (
            <p className="text-2xs text-slate-600 font-mono">No linked items in current buffer.</p>
          ) : (
            <ul className="space-y-1.5">
              {linkedNews.map(n => (
                <li key={n.id} className="text-2xs">
                  <div className="flex items-center gap-2 text-slate-500 font-mono">
                    <span>{n.source}</span>
                    <span>·</span>
                    <span>{fmtTimeShort(n.ts)}</span>
                    <span>·</span>
                    <span
                      className="px-1 rounded-sm border"
                      style={{
                        color: leanColor(n.sentimentImpact * 20, 80),
                        borderColor: leanColor(n.sentimentImpact * 20, 80),
                      }}
                    >
                      {fmtDelta(n.sentimentImpact)}
                    </span>
                  </div>
                  <div className="text-ivory leading-snug mt-0.5">{n.headline}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Provenance footnote */}
        <div className="pt-2 border-t border-slate-800/80 text-2xs text-slate-600 font-mono">
          src: {s.sources.join(' + ')} · last tick {fmtTimeShort(s.lastTickAt)}
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800 px-2 py-1.5 rounded-sm">
      <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono">{label}</div>
      <div className="text-base font-mono text-ivory tabular-nums leading-tight">
        {value}<span className="text-slate-500 text-xs ml-0.5">{unit}</span>
      </div>
    </div>
  );
}
