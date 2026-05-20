// Seeded news templates. The ingester picks one each cycle, fills variables,
// and emits a NewsItem with realistic-feeling structure.
//
// These are synthetic and labeled as such (confidence MED at best, source 'sim').
// Live mode swaps this for GDELT / Common Crawl news adapters.

import type { IssueKey } from '@/lib/types';

export interface NewsTemplate {
  source: string;
  headline: string;     // %S for state, %P for politician token
  summary: string;
  issue: IssueKey;
  meanImpact: number;   // sentiment push, signed
  stddevImpact: number;
  intensityMean: number;
  swingTowards: 'R' | 'D' | 'either';
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
  {
    source: 'AP Sim Wire',
    headline: 'Manufacturing payrolls rise in %S, easing recession concerns',
    summary: 'Latest BLS data shows monthly nonfarm payrolls in %S rebounded above consensus, with the manufacturing subindex leading. Analysts note the print may shift the incumbent narrative.',
    issue: 'economy',
    meanImpact: 2.2, stddevImpact: 1.5, intensityMean: 6, swingTowards: 'either',
  },
  {
    source: 'Reuters Sim',
    headline: 'Border encounter numbers in %S spark renewed enforcement debate',
    summary: 'CBP data for %S indicates a sharp month-over-month change in southern border encounters. State officials and federal counterparts trade public statements.',
    issue: 'immigration',
    meanImpact: 3.4, stddevImpact: 1.8, intensityMean: 10, swingTowards: 'R',
  },
  {
    source: 'NYT Sim',
    headline: '%S hospitals face staffing shortage; state lawmakers signal Medicaid action',
    summary: 'Hospital association reports rural facilities in %S hit critical staffing levels. A bipartisan working group proposes a targeted Medicaid expansion vote next session.',
    issue: 'healthcare',
    meanImpact: -2.8, stddevImpact: 1.5, intensityMean: 7, swingTowards: 'D',
  },
  {
    source: 'WSJ Sim',
    headline: 'Supreme Court ruling reshapes %S election administration',
    summary: 'The Court declined to take up an appeal from %S\'s election commission, leaving in place a lower-court order that revises voter-roll maintenance procedures.',
    issue: 'elections',
    meanImpact: 1.4, stddevImpact: 2.0, intensityMean: 12, swingTowards: 'either',
  },
  {
    source: 'CNN Sim',
    headline: 'Major plant closure in %S triggers congressional response',
    summary: 'A multinational announced layoffs at its %S facility. Both senators issued statements; the governor convened an emergency workforce briefing.',
    issue: 'economy',
    meanImpact: -3.5, stddevImpact: 1.6, intensityMean: 11, swingTowards: 'either',
  },
  {
    source: 'Fox Sim',
    headline: 'Polling shows shift in %S on energy production policy',
    summary: 'Fresh survey of %S registered voters shows a 4-point swing on questions of domestic energy production. Pollster cites recent fuel-price moves.',
    issue: 'climate',
    meanImpact: 2.6, stddevImpact: 1.4, intensityMean: 8, swingTowards: 'R',
  },
  {
    source: 'NPR Sim',
    headline: 'Climate adaptation funding announced for %S',
    summary: 'Federal grant program will direct funds to %S coastal/resilience projects. Local officials describe the move as long-overdue.',
    issue: 'climate',
    meanImpact: -1.8, stddevImpact: 1.2, intensityMean: 5, swingTowards: 'D',
  },
  {
    source: 'Politico Sim',
    headline: '%S delegation splits on Senate procedure vote',
    summary: 'A high-visibility cloture vote drew a split delegation from %S. Both sides will face contested primary races within 18 months.',
    issue: 'elections',
    meanImpact: 0.4, stddevImpact: 2.4, intensityMean: 9, swingTowards: 'either',
  },
  {
    source: 'Bloomberg Sim',
    headline: 'CPI print pressures %S household budgets',
    summary: 'Regional CPI breakdown shows %S above the national average for the third straight month, with shelter and groceries as the largest contributors.',
    issue: 'economy',
    meanImpact: 3.0, stddevImpact: 1.2, intensityMean: 9, swingTowards: 'R',
  },
  {
    source: 'AP Sim Wire',
    headline: 'Civil rights complaint filed in %S over voter ID enforcement',
    summary: 'Plaintiffs allege uneven application of recent ID rules in %S precincts. State attorney general\'s office issued a procedural response.',
    issue: 'civil-rights',
    meanImpact: -2.4, stddevImpact: 1.4, intensityMean: 10, swingTowards: 'D',
  },
  {
    source: 'Reuters Sim',
    headline: 'Foreign policy briefing places %S strategically in spotlight',
    summary: 'DOD readout names %S installations in upcoming logistics review. Congressional delegation requested classified follow-up.',
    issue: 'foreign-policy',
    meanImpact: 1.0, stddevImpact: 1.5, intensityMean: 6, swingTowards: 'either',
  },
  {
    source: 'Local Sim Tribune',
    headline: 'Crime statistics in %S metro show year-over-year decline',
    summary: 'Annual report indicates violent crime down in %S\'s largest metro. Mayor cites coordinated enforcement; state opposition disputes methodology.',
    issue: 'crime',
    meanImpact: -1.6, stddevImpact: 1.2, intensityMean: 6, swingTowards: 'D',
  },
  {
    source: 'WaPo Sim',
    headline: 'High-profile crime incident in %S draws national coverage',
    summary: 'Incident in a %S metropolitan area is dominating national cable coverage. State leadership facing pointed questions on enforcement posture.',
    issue: 'crime',
    meanImpact: 3.6, stddevImpact: 1.8, intensityMean: 13, swingTowards: 'R',
  },
];
