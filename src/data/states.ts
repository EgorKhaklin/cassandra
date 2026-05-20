// State metadata: FIPS, USPS code, name, electoral votes, baseline partisan lean.
// Baseline leans are public-domain synthesis (2024 results, rounded). They are
// SEED values for the simulation; the engine drifts them in real time. They are
// NOT a forecast.

export interface StateMeta {
  fips: string;          // '06'
  code: string;          // 'CA'
  name: string;          // 'California'
  ev: number;            // electoral votes
  baselineLean: number;  // -100..+100, D..R (seed only)
  baselineIntensity: number; // 0..100
  pop2020M: number;      // population in millions (informational)
  region: 'NE' | 'MW' | 'S' | 'W' | 'NC';
}

export const STATES: readonly StateMeta[] = Object.freeze([
  { fips: '01', code: 'AL', name: 'Alabama',        ev: 9,  baselineLean: 30,  baselineIntensity: 55, pop2020M: 5.03, region: 'S'  },
  { fips: '02', code: 'AK', name: 'Alaska',         ev: 3,  baselineLean: 13,  baselineIntensity: 50, pop2020M: 0.73, region: 'W'  },
  { fips: '04', code: 'AZ', name: 'Arizona',        ev: 11, baselineLean: 5,   baselineIntensity: 78, pop2020M: 7.15, region: 'W'  },
  { fips: '05', code: 'AR', name: 'Arkansas',       ev: 6,  baselineLean: 27,  baselineIntensity: 48, pop2020M: 3.01, region: 'S'  },
  { fips: '06', code: 'CA', name: 'California',     ev: 54, baselineLean: -20, baselineIntensity: 70, pop2020M: 39.5, region: 'W'  },
  { fips: '08', code: 'CO', name: 'Colorado',       ev: 10, baselineLean: -11, baselineIntensity: 65, pop2020M: 5.77, region: 'W'  },
  { fips: '09', code: 'CT', name: 'Connecticut',    ev: 7,  baselineLean: -15, baselineIntensity: 56, pop2020M: 3.61, region: 'NE' },
  { fips: '10', code: 'DE', name: 'Delaware',       ev: 3,  baselineLean: -15, baselineIntensity: 50, pop2020M: 0.99, region: 'NE' },
  { fips: '11', code: 'DC', name: 'District of Columbia', ev: 3, baselineLean: -82, baselineIntensity: 65, pop2020M: 0.69, region: 'NE' },
  { fips: '12', code: 'FL', name: 'Florida',        ev: 30, baselineLean: 13,  baselineIntensity: 78, pop2020M: 21.5, region: 'S'  },
  { fips: '13', code: 'GA', name: 'Georgia',        ev: 16, baselineLean: 2,   baselineIntensity: 80, pop2020M: 10.7, region: 'S'  },
  { fips: '15', code: 'HI', name: 'Hawaii',         ev: 4,  baselineLean: -25, baselineIntensity: 48, pop2020M: 1.45, region: 'W'  },
  { fips: '16', code: 'ID', name: 'Idaho',          ev: 4,  baselineLean: 35,  baselineIntensity: 50, pop2020M: 1.84, region: 'W'  },
  { fips: '17', code: 'IL', name: 'Illinois',       ev: 19, baselineLean: -10, baselineIntensity: 60, pop2020M: 12.8, region: 'MW' },
  { fips: '18', code: 'IN', name: 'Indiana',        ev: 11, baselineLean: 16,  baselineIntensity: 55, pop2020M: 6.79, region: 'MW' },
  { fips: '19', code: 'IA', name: 'Iowa',           ev: 6,  baselineLean: 13,  baselineIntensity: 60, pop2020M: 3.19, region: 'MW' },
  { fips: '20', code: 'KS', name: 'Kansas',         ev: 6,  baselineLean: 16,  baselineIntensity: 55, pop2020M: 2.94, region: 'MW' },
  { fips: '21', code: 'KY', name: 'Kentucky',       ev: 8,  baselineLean: 25,  baselineIntensity: 50, pop2020M: 4.51, region: 'S'  },
  { fips: '22', code: 'LA', name: 'Louisiana',      ev: 8,  baselineLean: 21,  baselineIntensity: 52, pop2020M: 4.66, region: 'S'  },
  { fips: '23', code: 'ME', name: 'Maine',          ev: 4,  baselineLean: -7,  baselineIntensity: 56, pop2020M: 1.36, region: 'NE' },
  { fips: '24', code: 'MD', name: 'Maryland',       ev: 10, baselineLean: -27, baselineIntensity: 55, pop2020M: 6.18, region: 'NE' },
  { fips: '25', code: 'MA', name: 'Massachusetts',  ev: 11, baselineLean: -25, baselineIntensity: 60, pop2020M: 7.03, region: 'NE' },
  { fips: '26', code: 'MI', name: 'Michigan',       ev: 15, baselineLean: 2,   baselineIntensity: 82, pop2020M: 10.0, region: 'MW' },
  { fips: '27', code: 'MN', name: 'Minnesota',      ev: 10, baselineLean: -4,  baselineIntensity: 65, pop2020M: 5.71, region: 'MW' },
  { fips: '28', code: 'MS', name: 'Mississippi',    ev: 6,  baselineLean: 24,  baselineIntensity: 50, pop2020M: 2.96, region: 'S'  },
  { fips: '29', code: 'MO', name: 'Missouri',       ev: 10, baselineLean: 19,  baselineIntensity: 58, pop2020M: 6.15, region: 'MW' },
  { fips: '30', code: 'MT', name: 'Montana',        ev: 4,  baselineLean: 22,  baselineIntensity: 50, pop2020M: 1.08, region: 'W'  },
  { fips: '31', code: 'NE', name: 'Nebraska',       ev: 5,  baselineLean: 22,  baselineIntensity: 50, pop2020M: 1.96, region: 'MW' },
  { fips: '32', code: 'NV', name: 'Nevada',         ev: 6,  baselineLean: 4,   baselineIntensity: 72, pop2020M: 3.11, region: 'W'  },
  { fips: '33', code: 'NH', name: 'New Hampshire',  ev: 4,  baselineLean: -3,  baselineIntensity: 60, pop2020M: 1.38, region: 'NE' },
  { fips: '34', code: 'NJ', name: 'New Jersey',     ev: 14, baselineLean: -7,  baselineIntensity: 60, pop2020M: 9.29, region: 'NE' },
  { fips: '35', code: 'NM', name: 'New Mexico',     ev: 5,  baselineLean: -7,  baselineIntensity: 55, pop2020M: 2.12, region: 'W'  },
  { fips: '36', code: 'NY', name: 'New York',       ev: 28, baselineLean: -13, baselineIntensity: 58, pop2020M: 20.2, region: 'NE' },
  { fips: '37', code: 'NC', name: 'North Carolina', ev: 16, baselineLean: 3,   baselineIntensity: 80, pop2020M: 10.4, region: 'S'  },
  { fips: '38', code: 'ND', name: 'North Dakota',   ev: 3,  baselineLean: 33,  baselineIntensity: 45, pop2020M: 0.78, region: 'MW' },
  { fips: '39', code: 'OH', name: 'Ohio',           ev: 17, baselineLean: 11,  baselineIntensity: 68, pop2020M: 11.8, region: 'MW' },
  { fips: '40', code: 'OK', name: 'Oklahoma',       ev: 7,  baselineLean: 33,  baselineIntensity: 48, pop2020M: 3.96, region: 'S'  },
  { fips: '41', code: 'OR', name: 'Oregon',         ev: 8,  baselineLean: -14, baselineIntensity: 60, pop2020M: 4.24, region: 'W'  },
  { fips: '42', code: 'PA', name: 'Pennsylvania',   ev: 19, baselineLean: 2,   baselineIntensity: 85, pop2020M: 13.0, region: 'NE' },
  { fips: '44', code: 'RI', name: 'Rhode Island',   ev: 4,  baselineLean: -14, baselineIntensity: 50, pop2020M: 1.10, region: 'NE' },
  { fips: '45', code: 'SC', name: 'South Carolina', ev: 9,  baselineLean: 18,  baselineIntensity: 55, pop2020M: 5.12, region: 'S'  },
  { fips: '46', code: 'SD', name: 'South Dakota',   ev: 3,  baselineLean: 29,  baselineIntensity: 48, pop2020M: 0.89, region: 'MW' },
  { fips: '47', code: 'TN', name: 'Tennessee',      ev: 11, baselineLean: 23,  baselineIntensity: 55, pop2020M: 6.91, region: 'S'  },
  { fips: '48', code: 'TX', name: 'Texas',          ev: 40, baselineLean: 14,  baselineIntensity: 72, pop2020M: 29.1, region: 'S'  },
  { fips: '49', code: 'UT', name: 'Utah',           ev: 6,  baselineLean: 22,  baselineIntensity: 50, pop2020M: 3.27, region: 'W'  },
  { fips: '50', code: 'VT', name: 'Vermont',        ev: 3,  baselineLean: -32, baselineIntensity: 50, pop2020M: 0.64, region: 'NE' },
  { fips: '51', code: 'VA', name: 'Virginia',       ev: 13, baselineLean: -6,  baselineIntensity: 65, pop2020M: 8.63, region: 'S'  },
  { fips: '53', code: 'WA', name: 'Washington',     ev: 12, baselineLean: -19, baselineIntensity: 60, pop2020M: 7.71, region: 'W'  },
  { fips: '54', code: 'WV', name: 'West Virginia',  ev: 4,  baselineLean: 39,  baselineIntensity: 48, pop2020M: 1.79, region: 'S'  },
  { fips: '55', code: 'WI', name: 'Wisconsin',      ev: 10, baselineLean: 1,   baselineIntensity: 83, pop2020M: 5.89, region: 'MW' },
  { fips: '56', code: 'WY', name: 'Wyoming',        ev: 3,  baselineLean: 43,  baselineIntensity: 45, pop2020M: 0.58, region: 'W'  },
]);

export const FIPS_TO_STATE: Record<string, StateMeta> = Object.fromEntries(
  STATES.map(s => [s.fips, s])
);
export const CODE_TO_STATE: Record<string, StateMeta> = Object.fromEntries(
  STATES.map(s => [s.code, s])
);

/** Swing states (|baselineLean| <= 5). Used by alert rules. */
export const SWING_STATES = STATES.filter(s => Math.abs(s.baselineLean) <= 5).map(s => s.code);
