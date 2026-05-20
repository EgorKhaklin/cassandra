'use client';

import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/Card';
import { severityColor } from '@/lib/color-scale';
import { fmtClock, fmtTimeShort } from '@/lib/format';

export function AlertsCenter() {
  const alerts = useAppStore(s => s.alerts);
  const setSelected = useAppStore(s => s.setSelected);
  const ackAlert = useAppStore(s => s.ackAlert);

  const unack = alerts.filter(a => !a.ackd).length;

  return (
    <Card title="Alerts" badge={`${unack}/${alerts.length}`} badgeColor="#d4a437">
      {alerts.length === 0 ? (
        <p className="text-2xs text-slate-600 font-mono">no alerts in buffer</p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {alerts.slice(0, 18).map(a => (
            <li
              key={a.id}
              onClick={() => {
                if (a.stateCode) setSelected(a.stateCode);
                ackAlert(a.id);
              }}
              className={`group cursor-pointer px-2 py-1.5 rounded-sm border transition-colors ${
                a.ackd
                  ? 'border-slate-900 bg-slate-950/40 opacity-60'
                  : 'border-slate-800 bg-slate-950/60 hover:border-gold/40'
              }`}
              style={{ borderLeft: `3px solid ${severityColor(a.severity)}` }}
            >
              <div className="flex items-center justify-between text-2xs font-mono">
                <span
                  className="uppercase tracking-widest"
                  style={{ color: severityColor(a.severity) }}
                >
                  {a.severity}
                </span>
                <span className="text-slate-600">{fmtClock(a.ts)} · {fmtTimeShort(a.ts)}</span>
              </div>
              <div className="text-xs text-ivory leading-snug mt-0.5">{a.title}</div>
              <div className="text-2xs text-slate-400 leading-snug mt-0.5">{a.detail}</div>
              <div className="text-[10px] text-slate-700 font-mono mt-0.5 uppercase tracking-widest">
                {a.rule}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
