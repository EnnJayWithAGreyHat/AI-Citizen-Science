import React, { useEffect, useMemo, useState } from 'react';
import './MyGarden.scss';

type GardenCategoryKey =
  | 'plants'
  | 'insects'
  | 'birds'
  | 'amphibians'
  | 'reptiles'
  | 'mammals'
  | 'fungi'
  | 'other';

type HabitatState = 'locked' | 'sprouting' | 'blooming' | 'thriving' | 'flourishing';

type RawObservationDoc = Record<string, unknown>;

interface NormalizedObservation {
  id: string;
  taxonKey: string;
  displayName: string;
  scientificName?: string;
  commonName?: string;
  categoryKey: GardenCategoryKey;
  observedAt?: string;
  verified?: boolean;
  sourceLabel?: string;
  isTaxonSpecific: boolean;
}

interface HabitatMeta {
  key: GardenCategoryKey;
  label: string;
  habitatName: string;
  singular: string;
  icon: string;
  description: string;
}

interface HabitatProgress {
  meta: HabitatMeta;
  observations: NormalizedObservation[];
  distinctTaxa: NormalizedObservation[];
  distinctCount: number;
  totalObservations: number;
  milestones: number[];
  nextMilestone?: number;
  progressPercent: number;
  state: HabitatState;
  stateLabel: string;
}

interface GardenViewModel {
  normalized: NormalizedObservation[];
  habitatProgress: HabitatProgress[];
  totalObservations: number;
  distinctTotal: number;
  habitatsUnlocked: number;
  habitatTotal: number;
  overallProgress: number;
  nextMilestoneText: string;
  recentDiscoveries: NormalizedObservation[];
  hasRecentDates: boolean;
}

interface GardenLoaderResult {
  userId?: string;
  observations: RawObservationDoc[];
  isDemo: boolean;
}

interface MyGardenProps {
  userId?: string;
}

const HABITATS: HabitatMeta[] = [
  {
    key: 'plants',
    label: 'Plants',
    habitatName: 'Meadow',
    singular: 'plant',
    icon: '🌿',
    description: 'Wild grasses, blooms, and leafy life.',
  },
  {
    key: 'insects',
    label: 'Insects',
    habitatName: 'Pollinator Patch',
    singular: 'insect',
    icon: '🦋',
    description: 'Bees, butterflies, and tiny workers.',
  },
  {
    key: 'birds',
    label: 'Birds',
    habitatName: 'Bird Grove',
    singular: 'bird',
    icon: '🐦',
    description: 'Song, flight, and feathered visitors.',
  },
  {
    key: 'amphibians',
    label: 'Amphibians',
    habitatName: 'Pond',
    singular: 'amphibian',
    icon: '🐸',
    description: 'A calm edge for frogs and salamanders.',
  },
  {
    key: 'reptiles',
    label: 'Reptiles',
    habitatName: 'Sun Rock',
    singular: 'reptile',
    icon: '🦎',
    description: 'Warm stones for scales and sun.',
  },
  {
    key: 'mammals',
    label: 'Mammals',
    habitatName: 'Night Nook',
    singular: 'mammal',
    icon: '🦊',
    description: 'Quiet tracks and twilight roamers.',
  },
  {
    key: 'fungi',
    label: 'Fungi',
    habitatName: 'Fallen Log',
    singular: 'fungus',
    icon: '🍄',
    description: 'Hidden networks and forest keepers.',
  },
  {
    key: 'other',
    label: 'Other',
    habitatName: 'Wild Corner',
    singular: 'discovery',
    icon: '✨',
    description: 'Unsorted life waiting for a home.',
  },
];

const HABITAT_LOOKUP: Record<GardenCategoryKey, HabitatMeta> = HABITATS.reduce(
  (acc, habitat) => {
    acc[habitat.key] = habitat;
    return acc;
  },
  {} as Record<GardenCategoryKey, HabitatMeta>,
);

const HABITAT_MILESTONES: Record<GardenCategoryKey, number[]> = {
  plants: [1, 3, 6, 10],
  insects: [1, 3, 5, 8],
  birds: [1, 4, 7, 12],
  amphibians: [1, 2, 4, 6],
  reptiles: [1, 2, 4, 6],
  mammals: [1, 3, 5, 8],
  fungi: [1, 2, 4, 6],
  other: [1, 2, 3, 5],
};

const GENERIC_LABELS = new Set([
  'bird',
  'birds',
  'aves',
  'insect',
  'insects',
  'insecta',
  'plant',
  'plants',
  'plantae',
  'fungi',
  'fungus',
  'mammal',
  'mammals',
  'mammalia',
  'reptile',
  'reptiles',
  'reptilia',
  'amphibian',
  'amphibians',
  'amphibia',
  'animal',
  'animals',
  'unknown',
  'other',
]);

const MAX_CHIPS = 8;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

async function loadGardenDataForUser(userId?: string): Promise<GardenLoaderResult> {
  /*
    TODO: replace mock loader with Firebase auth + Firestore query
    - Get current user id from Firebase Auth (or use the passed userId prop).
    - Query observations for that user id in Firestore.
    - Expect raw fields like:
      id / doc.id / recordId
      taxonName / speciesName / commonName / scientificName
      category / iconicTaxon / group / className / kingdom
      observedAt / createdAt / timestamp
      verified / researchGrade / isConfirmed
  */
  await delay(450);

  const mockObservations: RawObservationDoc[] = [
    {
      id: 'obs-001',
      commonName: 'Monarch Butterfly',
      scientificName: 'Danaus plexippus',
      category: 'insects',
      observedAt: '2026-03-28T10:12:00Z',
      verified: true,
      sourceLabel: 'Neighborhood Walk',
    },
    {
      id: 'obs-002',
      taxonName: 'Anas platyrhynchos',
      commonName: 'Mallard',
      iconicTaxon: 'Aves',
      observedAt: '2026-03-26T08:45:00Z',
      researchGrade: true,
      sourceLabel: 'Park Pond',
    },
    {
      id: 'obs-003',
      speciesName: 'Quercus agrifolia',
      commonName: 'Coast Live Oak',
      category: 'plants',
      createdAt: '2026-03-25T18:20:00Z',
    },
    {
      id: 'obs-004',
      scientificName: 'Rana draytonii',
      commonName: 'California Red-legged Frog',
      className: 'Amphibia',
      observedAt: '2026-03-24T06:05:00Z',
      isConfirmed: true,
    },
    {
      id: 'obs-005',
      commonName: 'Western Fence Lizard',
      scientificName: 'Sceloporus occidentalis',
      group: 'Reptilia',
      observedAt: '2026-03-24T12:30:00Z',
    },
    {
      id: 'obs-006',
      commonName: 'Coyote',
      scientificName: 'Canis latrans',
      category: 'mammals',
      observedAt: '2026-03-23T21:02:00Z',
    },
    {
      id: 'obs-007',
      commonName: 'Turkey Tail',
      scientificName: 'Trametes versicolor',
      category: 'fungi',
      observedAt: '2026-03-22T09:15:00Z',
      verified: true,
    },
    {
      id: 'obs-008',
      commonName: 'Honey Bee',
      scientificName: 'Apis mellifera',
      iconicTaxon: 'Insecta',
      observedAt: '2026-03-21T10:54:00Z',
    },
    {
      id: 'obs-009',
      commonName: 'Mallard',
      scientificName: 'Anas platyrhynchos',
      category: 'birds',
      observedAt: '2026-03-20T08:12:00Z',
    },
    {
      id: 'obs-010',
      commonName: 'White-tailed Kite',
      scientificName: 'Elanus leucurus',
      category: 'birds',
      observedAt: '2026-03-18T17:42:00Z',
    },
    {
      id: 'obs-011',
      commonName: 'Common yarrow',
      scientificName: 'Achillea millefolium',
      category: 'plants',
      observedAt: '2026-03-18T09:05:00Z',
    },
    {
      id: 'obs-012',
      commonName: 'Mystery Bird',
      category: 'birds',
      observedAt: '2026-03-17T07:20:00Z',
    },
    {
      id: 'obs-013',
      commonName: 'Mourning Dove',
      scientificName: 'Zenaida macroura',
      category: 'birds',
      observedAt: '2026-03-16T07:15:00Z',
    },
    {
      id: 'obs-014',
      commonName: 'Black-tailed Deer',
      scientificName: 'Odocoileus hemionus',
      category: 'mammals',
      observedAt: '2026-03-16T20:30:00Z',
    },
    {
      id: 'obs-015',
      taxonName: 'Bird',
      category: 'birds',
      observedAt: '2026-03-15T06:00:00Z',
    },
    {
      id: 'obs-016',
      commonName: 'Unknown',
      category: 'other',
      observedAt: '2026-03-14T14:00:00Z',
    },
  ];

  return {
    userId,
    observations: mockObservations,
    isDemo: true,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const maybe = toStringValue(value);
    if (maybe) {
      return maybe;
    }
  }
  return undefined;
};

const normalizeLabel = (value?: string): string =>
  value ? value.toLowerCase().trim() : '';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const isGenericTaxonLabel = (label: string, categoryKey: GardenCategoryKey): boolean => {
  if (!label) {
    return true;
  }
  if (label.includes('unknown') || label.includes('unidentified') || label.includes('mystery')) {
    return true;
  }
  const tokens = label.split(' ').filter(Boolean);
  if (tokens.length === 1 && GENERIC_LABELS.has(tokens[0])) {
    return true;
  }
  const categoryLabel = normalizeLabel(HABITAT_LOOKUP[categoryKey]?.label);
  if (label === categoryLabel) {
    return true;
  }
  return false;
};

const mapToCategory = (value?: string): GardenCategoryKey => {
  if (!value) {
    return 'other';
  }
  const label = normalizeLabel(value);
  if (
    label.includes('bird') ||
    label.includes('aves') ||
    label.includes('raptor') ||
    label.includes('owl')
  ) {
    return 'birds';
  }
  if (
    label.includes('insect') ||
    label.includes('insecta') ||
    label.includes('pollinator') ||
    label.includes('butterfly') ||
    label.includes('bee')
  ) {
    return 'insects';
  }
  if (
    label.includes('plant') ||
    label.includes('plantae') ||
    label.includes('flora') ||
    label.includes('tree') ||
    label.includes('grass')
  ) {
    return 'plants';
  }
  if (label.includes('fungi') || label.includes('fungus') || label.includes('mushroom')) {
    return 'fungi';
  }
  if (label.includes('mammal') || label.includes('mammalia')) {
    return 'mammals';
  }
  if (label.includes('reptile') || label.includes('reptilia') || label.includes('snake')) {
    return 'reptiles';
  }
  if (label.includes('amphib') || label.includes('frog') || label.includes('salamander')) {
    return 'amphibians';
  }
  return 'other';
};

const parseDateValue = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  if (isRecord(value)) {
    const seconds = typeof value.seconds === 'number' ? value.seconds : undefined;
    if (seconds) {
      const parsed = new Date(seconds * 1000);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }
  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (['true', 'yes', 'y', 'verified', 'research'].includes(normalized)) {
      return true;
    }
    if (['false', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
};

const normalizeObservation = (
  raw: RawObservationDoc,
  fallbackId: string,
): NormalizedObservation | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const docRecord = isRecord(raw.doc) ? raw.doc : undefined;
  const nestedTaxon = isRecord(raw.taxon) ? raw.taxon : undefined;

  const id =
    firstString(raw.id, raw.recordId, raw.observationId, docRecord?.id, raw.uid) ?? fallbackId;

  const commonName = firstString(
    raw.commonName,
    raw.common_name,
    raw.vernacularName,
    nestedTaxon?.commonName,
    nestedTaxon?.preferredCommonName,
  );

  const scientificName = firstString(
    raw.scientificName,
    raw.scientific_name,
    raw.speciesName,
    raw.taxonName,
    nestedTaxon?.scientificName,
    nestedTaxon?.name,
  );

  const displayName = commonName ?? scientificName ?? firstString(raw.name, raw.title);

  const rawCategory = firstString(
    raw.category,
    raw.iconicTaxon,
    raw.iconicTaxonName,
    raw.group,
    raw.className,
    raw.kingdom,
    raw.taxonGroup,
    nestedTaxon?.iconicTaxonName,
    nestedTaxon?.rank,
  );

  const categoryKey = mapToCategory(rawCategory);
  const habitatMeta = HABITAT_LOOKUP[categoryKey];

  if (!displayName && !rawCategory) {
    return null;
  }

  const fallbackName = displayName ?? `Unidentified ${habitatMeta.singular}`;
  const normalizedLabel = normalizeLabel(fallbackName);
  const isSpecific = !isGenericTaxonLabel(normalizedLabel, categoryKey);

  const taxonKeySource = scientificName ?? fallbackName;
  const taxonKey = isSpecific ? slugify(taxonKeySource) : '';

  const observedAt =
    parseDateValue(raw.observedAt) ??
    parseDateValue(raw.createdAt) ??
    parseDateValue(raw.timestamp) ??
    parseDateValue(raw.date) ??
    parseDateValue(raw.seenAt);

  const verified =
    toBoolean(raw.verified) ?? toBoolean(raw.researchGrade) ?? toBoolean(raw.isConfirmed);

  const sourceLabel = firstString(raw.sourceLabel, raw.source, raw.origin);

  return {
    id,
    taxonKey,
    displayName: fallbackName,
    scientificName,
    commonName,
    categoryKey,
    observedAt,
    verified,
    sourceLabel,
    isTaxonSpecific: isSpecific,
  };
};

const normalizeObservations = (raw: RawObservationDoc[]): NormalizedObservation[] =>
  raw
    .map((item, index) => normalizeObservation(item, `obs-${index + 1}`))
    .filter((item): item is NormalizedObservation => Boolean(item));

const formatDate = (iso?: string): string => {
  if (!iso) {
    return 'Date not recorded';
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date not recorded';
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(parsed);
  } catch {
    return parsed.toLocaleDateString('en-US');
  }
};

const computeHabitatState = (distinctCount: number, milestones: number[]): HabitatState => {
  const [, second, third, max] = milestones;
  if (distinctCount === 0) {
    return 'locked';
  }
  if (second && distinctCount < second) {
    return 'sprouting';
  }
  if (third && distinctCount < third) {
    return 'blooming';
  }
  if (max && distinctCount < max) {
    return 'thriving';
  }
  return 'flourishing';
};

const stateLabels: Record<HabitatState, string> = {
  locked: 'Dormant',
  sprouting: 'Sprouting',
  blooming: 'Blooming',
  thriving: 'Thriving',
  flourishing: 'Flourishing',
};

const computeHabitatProgress = (
  meta: HabitatMeta,
  observations: NormalizedObservation[],
): HabitatProgress => {
  const milestones = HABITAT_MILESTONES[meta.key];
  const distinctMap = new Map<string, NormalizedObservation>();

  observations.forEach((observation) => {
    if (!observation.isTaxonSpecific || !observation.taxonKey) {
      return;
    }
    if (!distinctMap.has(observation.taxonKey)) {
      distinctMap.set(observation.taxonKey, observation);
    }
  });

  const distinctTaxa = Array.from(distinctMap.values()).sort((a, b) => {
    const dateA = a.observedAt ? new Date(a.observedAt).getTime() : 0;
    const dateB = b.observedAt ? new Date(b.observedAt).getTime() : 0;
    return dateB - dateA;
  });

  const distinctCount = distinctTaxa.length;
  const nextMilestone = milestones.find((milestone) => milestone > distinctCount);
  const maxMilestone = milestones[milestones.length - 1] ?? 1;
  const progressPercent = Math.min(100, Math.round((distinctCount / maxMilestone) * 100));
  const state = computeHabitatState(distinctCount, milestones);

  return {
    meta,
    observations,
    distinctTaxa,
    distinctCount,
    totalObservations: observations.length,
    milestones,
    nextMilestone,
    progressPercent,
    state,
    stateLabel: stateLabels[state],
  };
};

const computeNextMilestoneText = (progress: HabitatProgress[]): string => {
  let best: { needed: number; habitat: HabitatProgress } | null = null;

  progress.forEach((habitat) => {
    const nextMilestone = habitat.nextMilestone;
    if (!nextMilestone) {
      return;
    }
    const needed = nextMilestone - habitat.distinctCount;
    if (!best || needed < best.needed) {
      best = { needed, habitat };
    }
  });

  if (!best) {
    return 'All habitats are flourishing. Keep exploring to build your legacy.';
  }

  const neededLabel = best.needed === 1 ? '1 more' : `${best.needed} more`;
  const taxaLabel = best.needed === 1 ? 'taxon' : 'taxa';
  return `${neededLabel} ${best.habitat.meta.label.toLowerCase()} ${taxaLabel} to upgrade ${
    best.habitat.meta.habitatName
  }.`;
};

const buildGardenViewModel = (rawObservations: RawObservationDoc[]): GardenViewModel => {
  const normalized = normalizeObservations(rawObservations);
  const observationBuckets: Record<GardenCategoryKey, NormalizedObservation[]> = {
    plants: [],
    insects: [],
    birds: [],
    amphibians: [],
    reptiles: [],
    mammals: [],
    fungi: [],
    other: [],
  };

  normalized.forEach((observation) => {
    observationBuckets[observation.categoryKey].push(observation);
  });

  const habitatProgress = HABITATS.map((meta) =>
    computeHabitatProgress(meta, observationBuckets[meta.key]),
  );
  const otherCount = observationBuckets.other.length;
  const visibleHabitats = habitatProgress.filter(
    (habitat) => habitat.meta.key !== 'other' || otherCount > 0,
  );

  const totalObservations = rawObservations.length;
  const distinctTotal = visibleHabitats.reduce((sum, habitat) => sum + habitat.distinctCount, 0);
  const habitatsUnlocked = visibleHabitats.filter((habitat) => habitat.distinctCount > 0).length;
  const habitatTotal = visibleHabitats.length;
  const overallProgress =
    habitatTotal === 0
      ? 0
      : Math.round(
          visibleHabitats.reduce((sum, habitat) => sum + habitat.progressPercent, 0) /
            habitatTotal,
        );

  const nextMilestoneText = computeNextMilestoneText(visibleHabitats);

  const recentDiscoveries = [...normalized].sort((a, b) => {
    const timeA = a.observedAt ? new Date(a.observedAt).getTime() : 0;
    const timeB = b.observedAt ? new Date(b.observedAt).getTime() : 0;
    return timeB - timeA;
  });

  const hasRecentDates = recentDiscoveries.some((item) => Boolean(item.observedAt));

  return {
    normalized,
    habitatProgress: visibleHabitats,
    totalObservations,
    distinctTotal,
    habitatsUnlocked,
    habitatTotal,
    overallProgress,
    nextMilestoneText,
    recentDiscoveries: recentDiscoveries.slice(0, 6),
    hasRecentDates,
  };
};

const GardenSkeleton = () => (
  <div className="garden-skeleton" aria-busy="true" aria-live="polite">
    <div className="skeleton-hero">
      <div className="skeleton-line wide" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
    <div className="skeleton-grid">
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
    </div>
    <div className="skeleton-board">
      <div className="skeleton-card tall" />
      <div className="skeleton-card tall" />
      <div className="skeleton-card tall" />
    </div>
  </div>
);

export default function MyGarden({ userId }: MyGardenProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawObservations, setRawObservations] = useState<RawObservationDoc[]>([]);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    let isActive = true;
    setStatus('loading');
    setErrorMessage(null);

    loadGardenDataForUser(userId)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setRawObservations(result.observations);
        setIsDemo(result.isDemo);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unable to load garden data.';
        setErrorMessage(message);
        setStatus('error');
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  const viewModel = useMemo(() => buildGardenViewModel(rawObservations), [rawObservations]);
  const hasUserId = Boolean(userId);
  const isEmpty = viewModel.distinctTotal === 0;

  return (
    <section className="my-garden">
      <div className="garden-shell">
        <header className="garden-hero">
          <div className="hero-left">
            <div className="hero-kicker">My Garden</div>
            <h1>Grow a living sanctuary with every wildlife discovery.</h1>
            <p className="hero-copy">
              Each unique taxon you log brings your habitats to life. Track your life list, watch
              each zone level up, and keep a field journal of your latest sightings.
            </p>
            <div className="hero-badges">
              {isDemo && <span className="status-badge demo">Demo data</span>}
              {!hasUserId && <span className="status-badge signed-out">Sign in to personalize</span>}
              {status === 'error' && <span className="status-badge error">Data unavailable</span>}
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-progress-card">
              <div className="hero-progress-label">Sanctuary Growth</div>
              <div className="progress-track">
                <span className="progress-fill" style={{ width: `${viewModel.overallProgress}%` }} />
              </div>
              <div className="hero-progress-meta">
                <span>{viewModel.overallProgress}% thriving</span>
                <span>{viewModel.distinctTotal} distinct taxa</span>
              </div>
            </div>
          </div>
        </header>

        {!hasUserId && (
          <div className="garden-callout info">
            Your garden is showing demo data because no user is signed in yet.
          </div>
        )}

        {status === 'error' && (
          <div className="garden-callout error">
            We could not load your garden right now. {errorMessage}
          </div>
        )}

        {status === 'loading' ? (
          <GardenSkeleton />
        ) : (
          <>
            <section className="garden-summary" aria-label="Progress summary">
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Total Observations</div>
                  <div className="summary-value">{viewModel.totalObservations}</div>
                  <div className="summary-meta">Uploads and repeats included</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Distinct Taxa</div>
                  <div className="summary-value">{viewModel.distinctTotal}</div>
                  <div className="summary-meta">Life-list discoveries</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Habitats Unlocked</div>
                  <div className="summary-value">
                    {viewModel.habitatsUnlocked}/{viewModel.habitatTotal}
                  </div>
                  <div className="summary-meta">Zones now active</div>
                </div>
                <div className="summary-card highlight">
                  <div className="summary-label">Next Milestone</div>
                  <div className="summary-value small">{viewModel.nextMilestoneText}</div>
                </div>
              </div>
            </section>

            <section className="garden-board" aria-label="Habitat board">
              <div className="section-header">
                <h2>Habitat Board</h2>
                <p>
                  Each habitat levels up with distinct taxa. Repeats count toward total observations
                  but do not inflate progress.
                </p>
              </div>

              {isEmpty && (
                <div className="garden-callout empty">
                  Start your sanctuary with your first wildlife observation. Each unique taxon
                  brings a habitat to life.
                </div>
              )}

              <div className="habitat-grid">
                {viewModel.habitatProgress.map((habitat) => {
                  const chipList = habitat.distinctTaxa.slice(0, MAX_CHIPS);
                  const extraCount = habitat.distinctTaxa.length - chipList.length;
                  const nextLabel = habitat.nextMilestone
                    ? `${habitat.nextMilestone - habitat.distinctCount} more ${habitat.meta.singular} ${
                        habitat.nextMilestone - habitat.distinctCount === 1 ? 'taxon' : 'taxa'
                      } to reach ${habitat.nextMilestone}`
                    : 'Habitat flourishing';

                  return (
                    <article
                      key={habitat.meta.key}
                      className={`habitat-card is-${habitat.state}`}
                      data-habitat={habitat.meta.key}
                    >
                      <div className="habitat-top">
                        <div>
                          <div className="habitat-title">
                            <span className="habitat-icon">{habitat.meta.icon}</span>
                            <div>
                              <div className="habitat-name">{habitat.meta.habitatName}</div>
                              <div className="habitat-tag">{habitat.meta.label}</div>
                            </div>
                          </div>
                          <div className="habitat-description">{habitat.meta.description}</div>
                        </div>
                        <div className="habitat-state">{habitat.stateLabel}</div>
                      </div>

                      <div className="habitat-progress">
                        <div className="progress-track">
                          <span
                            className="progress-fill"
                            style={{ width: `${habitat.progressPercent}%` }}
                          />
                        </div>
                        <div className="habitat-stats">
                          <span>{habitat.distinctCount} distinct taxa</span>
                          <span>{habitat.totalObservations} observations</span>
                        </div>
                      </div>

                      <div className="habitat-chips">
                        {chipList.length === 0 ? (
                          <div className="habitat-empty">
                            No discoveries yet. Add your first {habitat.meta.singular}.
                          </div>
                        ) : (
                          chipList.map((taxon) => (
                            <span
                              key={taxon.taxonKey}
                              className={`chip ${taxon.verified ? 'verified' : ''}`}
                              title={taxon.scientificName ?? taxon.displayName}
                            >
                              {taxon.displayName}
                            </span>
                          ))
                        )}
                        {extraCount > 0 && (
                          <span className="chip muted">+{extraCount} more</span>
                        )}
                      </div>

                      <div className="habitat-next">{nextLabel}</div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="garden-journal" aria-label="Recent discoveries">
              <div className="section-header">
                <h2>Field Journal</h2>
                <p>Recent discoveries keep your garden grounded in real observations.</p>
              </div>

              {viewModel.recentDiscoveries.length === 0 ? (
                <div className="garden-callout empty">
                  No recent discoveries yet. Log a new observation to start your journal.
                </div>
              ) : (
                <div className="journal-list">
                  {viewModel.recentDiscoveries.map((entry) => (
                    <div key={entry.id} className="journal-item">
                      <div className="journal-name">{entry.displayName}</div>
                      <div className="journal-meta">
                        <span className="journal-category">
                          {HABITAT_LOOKUP[entry.categoryKey]?.habitatName}
                        </span>
                        <span className="journal-date">
                          {viewModel.hasRecentDates ? formatDate(entry.observedAt) : 'Date pending'}
                        </span>
                        {entry.verified && <span className="journal-badge">Verified</span>}
                      </div>
                      {entry.scientificName && (
                        <div className="journal-sci">{entry.scientificName}</div>
                      )}
                      {entry.sourceLabel && (
                        <div className="journal-source">{entry.sourceLabel}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </section>
  );
}