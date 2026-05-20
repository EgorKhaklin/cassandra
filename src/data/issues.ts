import type { IssueKey } from '@/lib/types';

export const ISSUES: { key: IssueKey; label: string; baseSalience: number; lean: number }[] = [
  { key: 'economy',        label: 'Economy',        baseSalience: 0.92, lean: 8   },
  { key: 'immigration',    label: 'Immigration',    baseSalience: 0.78, lean: 16  },
  { key: 'healthcare',     label: 'Healthcare',     baseSalience: 0.62, lean: -14 },
  { key: 'foreign-policy', label: 'Foreign Policy', baseSalience: 0.58, lean: 6   },
  { key: 'climate',        label: 'Climate',        baseSalience: 0.48, lean: -22 },
  { key: 'civil-rights',   label: 'Civil Rights',   baseSalience: 0.55, lean: -18 },
  { key: 'elections',      label: 'Elections',      baseSalience: 0.50, lean: 4   },
  { key: 'crime',          label: 'Crime',          baseSalience: 0.60, lean: 12  },
];

export const ISSUE_KEYS: IssueKey[] = ISSUES.map(i => i.key);
