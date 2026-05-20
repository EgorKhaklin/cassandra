'use client';

import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/Card';
import { fmtLean, fmtDelta, fmtNum, issueLabel } from '@/lib/format';
import { leanColor, nationalLeanColor } from '@/lib/color-scale';
import { CODE_TO_STATE } from '@/data/states';

export function NationalMetrics() {
  const national = useAppStore(s => s.national);
  const setSelected = useAppStore(s => s.setSelected);

  if (!national) {
    return (
      <Card title="National rollup" badge="—" badgeColor="#3a4658">
        <p className="text-2xs text-slate-500 font-mono">awaiting first snapshot…</p>
      </Card>
    );
  }

  const totalEC = national.ecBalance.dem + national.ecBalance.rep + national.ecBalance.tossup;
  const dPct = (national.ecBalance.dem / totalEC) * 100;
  const rPct = (national.ecBalance.rep / totalEC) * 100;
  const tPct = (national.ecBalance.tossup / totalEC) * 100;

  return (
    <Card title="National rollup" badge={national.streamHealth} badgeColor="#3a8a5f">
      <div className="space-y-4">
        {/* National lean readout */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-sm border border-slate-700"
            style={{ background: nationalLeanColor(national.nationalLean) }}
          />
          <div>
            <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono">
              National lean (pop-weighted)
            </div>
            <div className="text-2xl font-mono font-semibold text-ivory leading-none tabular-nums">
              {fmtLean(national.nationalLean)}
            </div>
          </div>
        </div>

        {/* EC balance bar */}
        <div>
          <div className="flex items-center justify-between text-2xs font-mono mb-1">
            <span className="text-dem">D {national.ecBalance.dem}</span>
            <span className="text-slate-400">T {national.ecBalance.tossup}</span>
            <span className="text-rep">R {national.ecBalance.rep}</span>
          </div>
          <div className="flex h-2 rounded-sm overflow-hidden border border-slate-800">
            <div className="bg-dem" style={{ width: `${dPct}%` }} />
            <div className="bg-slate-700" style={{ width: `${tPct}%` }} />
            <div className="bg-rep" style={{ width: `${rPct}%` }} />
          </div>
          <div className="text-2xs text-slate-600 font-mono mt-1 text-center">
            Electoral College (270 to win)
          </div>
        </div>

        {/* Top movers */}
        <div>
          <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">
            Top movers
          </div>
          <ul className="space-y-0.5">
            {national.topMovers.slice(0, 5).map(m => {
              const meta = CODE_TO_STATE[m.code];
              return (
                <li
                  key={m.code}
                  className="flex items-center justify-between text-2xs font-mono cursor-pointer hover:bg-slate-800/30 px-1 py-0.5 rounded-sm"
                  onClick={() => setSelected(m.code)}
                >
                  <span className="text-slate-300">{meta?.name ?? m.code}</span>
                  <span
                    className="tabular-nums"
                    style={{ color: leanColor(m.delta * 20, 90) }}
                  >
                    {fmtDelta(m.delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Loudest issues */}
        <div>
          <div className="text-2xs uppercase tracking-widest text-slate-500 font-mono mb-1.5">
            Loudest issues
          </div>
          <ul className="space-y-1">
            {national.loudestIssues.slice(0, 5).map(i => (
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
                <span className="w-10 text-right tabular-nums text-slate-500">
                  {fmtNum(i.salience * 100, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
