import { ReactNode, useState } from 'react';

interface Props {
  title?: string;
  badge?: string;
  badgeColor?: string;
  children: ReactNode;
  className?: string;
  /** When true, an inline chevron collapses just this card's body. */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Card({
  title,
  badge,
  badgeColor,
  children,
  className = '',
  collapsible = true,
  defaultCollapsed = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className={`bg-graphite/85 backdrop-blur-sm border border-slate-800/80 rounded-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            {collapsible && (
              <button
                type="button"
                onClick={() => setCollapsed(c => !c)}
                aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
                className="text-slate-500 hover:text-gold transition-colors font-mono leading-none text-xs"
                style={{ width: 12 }}
              >
                {collapsed ? '▸' : '▾'}
              </button>
            )}
            <h3 className="text-2xs uppercase tracking-[0.18em] text-slate-400 font-mono truncate">
              {title}
            </h3>
          </div>
          {badge && (
            <span
              className="text-2xs font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border shrink-0"
              style={{ color: badgeColor ?? '#d4a437', borderColor: badgeColor ?? '#d4a437' }}
            >
              {badge}
            </span>
          )}
        </header>
      )}
      {!collapsed && <div className="p-3">{children}</div>}
    </section>
  );
}
