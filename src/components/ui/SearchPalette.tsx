'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { STATES } from '@/data/states';
import { Sigil } from './Sigil';
import { fmtLean } from '@/lib/format';
import { leanColor } from '@/lib/color-scale';

interface Match {
  code: string;
  name: string;
  ev: number;
  score: number;
}

function scoreMatch(query: string, code: string, name: string): number {
  const q = query.toLowerCase();
  if (!q) return 1;
  const c = code.toLowerCase();
  const n = name.toLowerCase();
  if (c === q) return 100;
  if (c.startsWith(q)) return 90;
  if (n === q) return 80;
  if (n.startsWith(q)) return 70;
  if (n.includes(q)) return 50;
  return 0;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setSelected = useAppStore(s => s.setSelected);
  const states = useAppStore(s => s.states);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpenRequest = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('cassandra-jump' as any, onOpenRequest);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cassandra-jump' as any, onOpenRequest);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const matches: Match[] = useMemo(() => {
    return STATES
      .map(s => ({ code: s.code, name: s.name, ev: s.ev, score: scoreMatch(q, s.code, s.name) }))
      .filter(m => m.score > 0 || !q)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 8);
  }, [q]);

  if (!open) return null;

  const commit = (code: string) => {
    setSelected(code);
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[520px] bg-graphite border border-gold/40 rounded-sm shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(212,164,55,0.18), 0 30px 80px -10px rgba(0,0,0,0.7)' }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/80">
          <Sigil size={18} />
          <span className="text-2xs font-mono uppercase tracking-[0.28em] text-slate-400">
            Jump
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(matches.length - 1, i + 1)); }
              else if (e.key === 'ArrowUp')  { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
              else if (e.key === 'Enter' && matches[idx]) { commit(matches[idx].code); }
            }}
            placeholder="Search state code or name…"
            className="flex-1 bg-transparent outline-none text-ivory placeholder:text-slate-600 font-mono text-sm"
          />
          <span className="text-2xs font-mono text-slate-600 border border-slate-800 px-1.5 py-px rounded-sm">
            ESC
          </span>
        </div>
        <ul className="py-1">
          {matches.length === 0 && (
            <li className="px-3 py-2 text-2xs font-mono text-slate-500">no matches</li>
          )}
          {matches.map((m, i) => {
            const s = states[m.code];
            const lean = s?.partisanLean ?? 0;
            const intensity = s?.intensity ?? 60;
            return (
              <li
                key={m.code}
                onMouseEnter={() => setIdx(i)}
                onClick={() => commit(m.code)}
                className={`px-3 py-1.5 cursor-pointer flex items-center gap-3 ${
                  i === idx ? 'bg-gold/10' : 'hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm border border-slate-700"
                  style={{ background: leanColor(lean, intensity) }}
                />
                <span className="font-mono font-semibold text-ivory text-sm w-9">{m.code}</span>
                <span className="text-sm text-slate-300 flex-1">{m.name}</span>
                <span className="font-mono text-2xs text-slate-500">{m.ev} EV</span>
                <span className="font-mono text-2xs tabular-nums text-slate-300 w-14 text-right">
                  {s ? fmtLean(lean) : '—'}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="px-3 py-1.5 border-t border-slate-800/80 text-2xs font-mono text-slate-600 flex items-center gap-3">
          <span>↑↓ navigate</span>
          <span>↵ commit</span>
          <span className="ml-auto">⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
