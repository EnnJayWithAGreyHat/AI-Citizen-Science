import { NativeModules, Platform } from 'react-native';

export type HeatmapBounds = {
  west: number;
  east: number;
  north: number;
  south: number;
};

export type HeatmapCategory = {
  id: string;
  label: string;
  color: string;
};

export type HeatmapSighting = {
  id: string;
  observedAt: string;
  day: string;
  month: string;
  category: string;
  speciesName: string;
  intensity: number;
  siteId: string;
  siteName: string;
  province: string;
  ecosystem: string;
  latitude: number;
  longitude: number;
};

export type HeatmapPayload = {
  datasetName: string;
  sourceNote: string;
  generatedAt: string;
  bounds: HeatmapBounds;
  availableDays: string[];
  availableMonths: string[];
  categories: HeatmapCategory[];
  sightings: HeatmapSighting[];
};

export type HeatmapCluster = {
  siteId: string;
  siteName: string;
  province: string;
  ecosystem: string;
  latitude: number;
  longitude: number;
  observationCount: number;
  speciesCount: number;
  totalIntensity: number;
  dominantCategory: string;
};

export type CategorySummary = {
  id: string;
  label: string;
  color: string;
  observationCount: number;
  speciesCount: number;
  siteCount: number;
};

export type HeatmapZone = {
  key: string;
  latitude: number;
  longitude: number;
  observationCount: number;
  speciesCount: number;
  totalIntensity: number;
  outerRadius: number;
  middleRadius: number;
  coreRadius: number;
  glowRadius: number;
  strength: number;
};

export type HeatmapDaySnapshot = {
  day: string;
  newTodayCount: number;
  visibleSightingsCount: number;
  distinctSpeciesCount: number;
  topHotspot?: HeatmapCluster;
  categoryObservationCounts: Record<string, number>;
  heatZones: HeatmapZone[];
};

const API_PATH = '/api/heatmap';

const MAP_BOUNDS: HeatmapBounds = {
  west: 94.0,
  east: 141.6,
  north: 6.5,
  south: -11.5,
};

const CATEGORY_DEFINITIONS: HeatmapCategory[] = [
  { id: 'tree', label: 'Trees', color: '#648F5C' },
  { id: 'mammal', label: 'Mammals', color: '#8C5F3C' },
  { id: 'shrub', label: 'Shrubs', color: '#88A067' },
  { id: 'bird', label: 'Birds', color: '#3E7A7C' },
  { id: 'coral', label: 'Corals', color: '#D9854F' },
  { id: 'insect', label: 'Insects', color: '#B49C55' },
];

const SITE_CATALOG = {
  'gunung-leuser': {
    siteName: 'Gunung Leuser',
    province: 'Aceh',
    ecosystem: 'Rainforest edge',
    latitude: 3.769,
    longitude: 97.131,
  },
  'bukit-barisan': {
    siteName: 'Bukit Barisan',
    province: 'West Sumatra',
    ecosystem: 'Highland forest',
    latitude: -0.948,
    longitude: 100.363,
  },
  'jakarta-bay': {
    siteName: 'Jakarta Bay',
    province: 'Jakarta',
    ecosystem: 'Mangrove coast',
    latitude: -6.047,
    longitude: 106.741,
  },
  'bromo-highlands': {
    siteName: 'Bromo Highlands',
    province: 'East Java',
    ecosystem: 'Volcanic uplands',
    latitude: -7.942,
    longitude: 112.953,
  },
  kutai: {
    siteName: 'Kutai',
    province: 'East Kalimantan',
    ecosystem: 'Lowland dipterocarp forest',
    latitude: 0.53,
    longitude: 117.417,
  },
  'tanjung-puting': {
    siteName: 'Tanjung Puting',
    province: 'Central Kalimantan',
    ecosystem: 'Peat swamp forest',
    latitude: -2.838,
    longitude: 111.956,
  },
  'lore-lindu': {
    siteName: 'Lore Lindu',
    province: 'Central Sulawesi',
    ecosystem: 'Montane forest',
    latitude: -1.32,
    longitude: 120.18,
  },
  'bali-barat': {
    siteName: 'Bali Barat',
    province: 'Bali',
    ecosystem: 'Dry forest and reef fringe',
    latitude: -8.124,
    longitude: 114.546,
  },
  komodo: {
    siteName: 'Komodo Coast',
    province: 'East Nusa Tenggara',
    ecosystem: 'Savanna coast and reef',
    latitude: -8.586,
    longitude: 119.488,
  },
  'raja-ampat': {
    siteName: 'Raja Ampat',
    province: 'Southwest Papua',
    ecosystem: 'Coral reef seascape',
    latitude: -0.429,
    longitude: 130.821,
  },
  halmahera: {
    siteName: 'Halmahera',
    province: 'North Maluku',
    ecosystem: 'Island rainforest',
    latitude: 1.103,
    longitude: 127.484,
  },
  merauke: {
    siteName: 'Merauke Wetlands',
    province: 'South Papua',
    ecosystem: 'Wetland mosaic',
    latitude: -8.493,
    longitude: 140.404,
  },
} as const;

type SiteId = keyof typeof SITE_CATALOG;

type DemoSightingSeed = [string, SiteId, string, string, number, number, number];

const DEMO_SIGHTINGS: DemoSightingSeed[] = [
  ['2025-01-08T09:15:00Z', 'gunung-leuser', 'mammal', 'Sumatran orangutan', 1.65, 0.082, -0.051],
  ['2025-01-15T11:40:00Z', 'jakarta-bay', 'tree', 'Rhizophora mangrove', 1.08, 0.034, 0.021],
  ['2025-01-20T14:20:00Z', 'raja-ampat', 'coral', 'Acropora coral', 1.72, 0.041, 0.109],
  ['2025-01-29T08:50:00Z', 'bali-barat', 'bird', 'Bali starling', 1.22, -0.028, 0.052],
  ['2025-02-05T10:05:00Z', 'bukit-barisan', 'shrub', 'Senduduk shrub', 1.0, 0.048, -0.037],
  ['2025-02-12T07:55:00Z', 'kutai', 'mammal', 'Proboscis monkey', 1.44, -0.071, 0.061],
  ['2025-02-18T16:10:00Z', 'lore-lindu', 'insect', 'Wallacean birdwing', 1.12, 0.039, -0.046],
  ['2025-02-26T13:35:00Z', 'komodo', 'coral', 'Table coral', 1.36, 0.058, -0.074],
  ['2025-03-04T09:30:00Z', 'tanjung-puting', 'mammal', 'Bornean orangutan', 1.74, 0.029, 0.043],
  ['2025-03-11T12:15:00Z', 'halmahera', 'bird', 'Standardwing bird-of-paradise', 1.31, 0.072, -0.038],
  ['2025-03-17T15:25:00Z', 'merauke', 'bird', 'Southern crowned pigeon', 1.24, -0.037, 0.082],
  ['2025-03-25T08:05:00Z', 'bromo-highlands', 'shrub', 'Javan edelweiss', 0.86, 0.047, -0.031],
  ['2025-04-03T06:50:00Z', 'jakarta-bay', 'bird', 'Little egret', 0.98, -0.018, 0.047],
  ['2025-04-09T11:35:00Z', 'raja-ampat', 'coral', 'Sea fan', 1.57, -0.054, 0.091],
  ['2025-04-18T13:55:00Z', 'lore-lindu', 'mammal', 'Babirusa', 1.34, -0.062, 0.028],
  ['2025-04-26T10:45:00Z', 'gunung-leuser', 'tree', 'Meranti tree', 1.23, 0.018, -0.024],
  ['2025-05-02T09:10:00Z', 'bali-barat', 'coral', 'Staghorn coral', 1.18, 0.032, -0.059],
  ['2025-05-10T16:40:00Z', 'kutai', 'insect', 'Lantern bug', 1.05, 0.051, 0.019],
  ['2025-05-19T14:05:00Z', 'komodo', 'shrub', 'Coastal pandan shrub', 0.98, -0.053, 0.036],
  ['2025-05-27T07:20:00Z', 'merauke', 'tree', 'Sago palm', 1.08, 0.024, -0.035],
  ['2025-06-06T08:45:00Z', 'bukit-barisan', 'tree', 'Cinnamon tree', 1.09, -0.043, 0.057],
  ['2025-06-13T12:55:00Z', 'tanjung-puting', 'tree', 'Ramin tree', 1.18, -0.048, 0.024],
  ['2025-06-21T15:30:00Z', 'raja-ampat', 'bird', 'Red bird-of-paradise', 1.43, 0.011, -0.121],
  ['2025-06-28T11:10:00Z', 'halmahera', 'insect', 'Atlas moth', 1.04, -0.029, 0.053],
  ['2025-07-07T09:25:00Z', 'jakarta-bay', 'insect', 'Mangrove dragonfly', 1.0, 0.015, -0.049],
  ['2025-07-15T07:40:00Z', 'lore-lindu', 'bird', 'Maleo', 1.39, 0.021, 0.062],
  ['2025-07-22T13:45:00Z', 'komodo', 'coral', 'Brain coral', 1.42, -0.079, -0.042],
  ['2025-07-30T16:25:00Z', 'gunung-leuser', 'mammal', 'Siamang', 1.27, -0.052, 0.029],
  ['2025-08-05T08:35:00Z', 'kutai', 'tree', 'Ironwood sapling', 1.21, 0.076, -0.064],
  ['2025-08-13T10:50:00Z', 'bali-barat', 'bird', 'Green peafowl', 1.11, -0.039, 0.026],
  ['2025-08-21T14:15:00Z', 'bromo-highlands', 'shrub', 'Mountain heath', 0.91, -0.058, 0.044],
  ['2025-08-29T06:40:00Z', 'merauke', 'mammal', 'Dusky pademelon', 1.19, 0.057, 0.014],
  ['2025-09-04T08:05:00Z', 'tanjung-puting', 'mammal', 'Clouded leopard', 1.41, 0.041, -0.057],
  ['2025-09-12T12:20:00Z', 'bukit-barisan', 'mammal', 'Sumatran serow', 1.28, 0.019, -0.052],
  ['2025-09-20T15:10:00Z', 'halmahera', 'bird', "Blyth's hornbill", 1.22, 0.046, 0.061],
  ['2025-09-27T11:35:00Z', 'raja-ampat', 'coral', 'Brain coral', 1.66, -0.018, 0.047],
  ['2025-10-03T09:50:00Z', 'lore-lindu', 'shrub', 'Forest tea shrub', 0.96, -0.034, -0.041],
  ['2025-10-11T07:15:00Z', 'gunung-leuser', 'insect', 'Leaf insect', 0.97, 0.047, 0.072],
  ['2025-10-19T13:05:00Z', 'jakarta-bay', 'tree', 'Nipah palm', 1.13, -0.044, -0.018],
  ['2025-10-28T10:25:00Z', 'komodo', 'bird', 'Yellow-crested cockatoo', 1.28, 0.052, 0.031],
  ['2025-11-06T08:30:00Z', 'kutai', 'mammal', 'Sun bear', 1.49, -0.024, 0.083],
  ['2025-11-14T12:45:00Z', 'merauke', 'tree', 'Paperbark tree', 1.03, -0.028, -0.071],
  ['2025-11-23T15:00:00Z', 'bali-barat', 'tree', 'Sea hibiscus', 1.02, 0.018, 0.074],
  ['2025-11-29T11:55:00Z', 'raja-ampat', 'coral', 'Table coral', 1.61, 0.033, -0.054],
  ['2025-12-05T09:20:00Z', 'bukit-barisan', 'shrub', 'Hill myrtle shrub', 0.94, -0.047, 0.024],
  ['2025-12-13T13:15:00Z', 'halmahera', 'tree', 'Moluccan fig', 1.08, 0.024, -0.019],
  ['2025-12-20T08:10:00Z', 'tanjung-puting', 'tree', 'Ulin tree', 1.26, -0.014, 0.058],
  ['2025-12-28T10:40:00Z', 'lore-lindu', 'mammal', 'Sulawesi civet', 1.31, 0.051, -0.012],
];

function dedupe(values: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      unique.push(value);
    }
  }

  return unique;
}

function enumerateDays(startDay: string, endDay: string) {
  const days: string[] = [];
  const current = new Date(`${startDay}T00:00:00Z`);
  const end = new Date(`${endDay}T00:00:00Z`);

  while (current <= end) {
    days.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}

function roundCoordinate(value: number) {
  return Math.round(value * 10000) / 10000;
}

function buildFallbackHeatmapPayload(): HeatmapPayload {
  const sightings = DEMO_SIGHTINGS.map(
    ([observedAt, siteId, category, speciesName, intensity, latitudeOffset, longitudeOffset], index) => {
      const site = SITE_CATALOG[siteId];
      return {
        id: `s-${String(index + 1).padStart(3, '0')}`,
        observedAt,
        day: observedAt.slice(0, 10),
        month: observedAt.slice(0, 7),
        category,
        speciesName,
        intensity,
        siteId,
        siteName: site.siteName,
        province: site.province,
        ecosystem: site.ecosystem,
        latitude: roundCoordinate(site.latitude + latitudeOffset),
        longitude: roundCoordinate(site.longitude + longitudeOffset),
      };
    },
  );

  return {
    datasetName: 'Indonesia Biodiversity Sponsor Demo',
    sourceNote:
      'Bundled sponsor dataset with geographically clustered demo sightings for offline frontend testing.',
    generatedAt: '2025-12-28T10:40:00Z',
    bounds: MAP_BOUNDS,
    availableDays: enumerateDays(sightings[0].day, sightings[sightings.length - 1].day),
    availableMonths: dedupe(sightings.map((sighting) => sighting.month)),
    categories: CATEGORY_DEFINITIONS,
    sightings,
  };
}

const FALLBACK_DATA = buildFallbackHeatmapPayload();

function normalizePayload(payload: Partial<HeatmapPayload>): HeatmapPayload {
  const normalizedSightings = (payload.sightings ?? FALLBACK_DATA.sightings)
    .map((sighting) => ({
      ...sighting,
      day: sighting.day ?? sighting.observedAt.slice(0, 10),
      month: sighting.month ?? sighting.observedAt.slice(0, 7),
    }))
    .sort((left, right) => left.observedAt.localeCompare(right.observedAt));

  const firstDay = normalizedSightings[0]?.day ?? FALLBACK_DATA.availableDays[0];
  const lastDay =
    normalizedSightings[normalizedSightings.length - 1]?.day ??
    FALLBACK_DATA.availableDays[FALLBACK_DATA.availableDays.length - 1];

  return {
    datasetName: payload.datasetName ?? FALLBACK_DATA.datasetName,
    sourceNote: payload.sourceNote ?? FALLBACK_DATA.sourceNote,
    generatedAt: payload.generatedAt ?? FALLBACK_DATA.generatedAt,
    bounds: payload.bounds ?? FALLBACK_DATA.bounds,
    availableDays:
      payload.availableDays && payload.availableDays.length > 0
        ? payload.availableDays
        : enumerateDays(firstDay, lastDay),
    availableMonths:
      payload.availableMonths && payload.availableMonths.length > 0
        ? payload.availableMonths
        : dedupe(normalizedSightings.map((sighting) => sighting.month)),
    categories:
      payload.categories && payload.categories.length > 0
        ? payload.categories
        : FALLBACK_DATA.categories,
    sightings: normalizedSightings,
  };
}

function getBackendCandidates() {
  const candidates = new Set<string>();

  candidates.add('http://127.0.0.1:8000');
  candidates.add('http://localhost:8000');

  if (Platform.OS === 'android') {
    candidates.add('http://10.0.2.2:8000');
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) {
    candidates.add(`http://${window.location.hostname}:8000`);
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (scriptUrl) {
    try {
      const bundleUrl = new URL(scriptUrl);
      if (bundleUrl.hostname) {
        candidates.add(`http://${bundleUrl.hostname}:8000`);
      }
    } catch {
      // Ignore malformed dev bundle URLs.
    }
  }

  return Array.from(candidates);
}

export async function loadHeatmapData() {
  let lastError: Error | null = null;

  for (const baseUrl of getBackendCandidates()) {
    try {
      const response = await fetch(`${baseUrl}${API_PATH}`);
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}.`);
      }

      const payload = normalizePayload((await response.json()) as HeatmapPayload);
      return {
        data: payload,
        sourceLabel: baseUrl,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unable to reach the backend.');
    }
  }

  return {
    data: FALLBACK_DATA,
    sourceLabel: 'Bundled demo snapshot',
    notice:
      lastError?.message ??
      'Backend unavailable. Using the bundled sponsor demo snapshot instead.',
  };
}

export function formatDayLabel(day: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${day}T00:00:00Z`));
}

export function formatCompactDay(day: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${day}T00:00:00Z`));
}

export function rgbaFromHex(hexColor: string, alpha: number) {
  const clean = hexColor.replace('#', '');
  const red = Number.parseInt(clean.slice(0, 2), 16);
  const green = Number.parseInt(clean.slice(2, 4), 16);
  const blue = Number.parseInt(clean.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getVisibleSightings(
  sightings: HeatmapSighting[],
  selectedDay: string,
  category: string = 'all',
) {
  return sightings.filter((sighting) => {
    const matchesDay = sighting.day <= selectedDay;
    const matchesCategory = category === 'all' || sighting.category === category;
    return matchesDay && matchesCategory;
  });
}

export function getDistinctSpeciesCount(sightings: HeatmapSighting[]) {
  return new Set(sightings.map((sighting) => sighting.speciesName)).size;
}

export function findLeadingProvince(sightings: HeatmapSighting[]) {
  const counts = new Map<string, number>();

  for (const sighting of sightings) {
    counts.set(sighting.province, (counts.get(sighting.province) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'None';
}

export function groupSightingsBySite(sightings: HeatmapSighting[]): HeatmapCluster[] {
  const grouped = new Map<
    string,
    HeatmapCluster & {
      speciesNames: Set<string>;
      categoryWeight: Record<string, number>;
    }
  >();

  for (const sighting of sightings) {
    const existing = grouped.get(sighting.siteId);

    if (existing) {
      existing.observationCount += 1;
      existing.totalIntensity += sighting.intensity;
      existing.speciesNames.add(sighting.speciesName);
      existing.categoryWeight[sighting.category] =
        (existing.categoryWeight[sighting.category] ?? 0) + sighting.intensity;
      continue;
    }

    grouped.set(sighting.siteId, {
      siteId: sighting.siteId,
      siteName: sighting.siteName,
      province: sighting.province,
      ecosystem: sighting.ecosystem,
      latitude: sighting.latitude,
      longitude: sighting.longitude,
      observationCount: 1,
      speciesCount: 1,
      totalIntensity: sighting.intensity,
      dominantCategory: sighting.category,
      speciesNames: new Set([sighting.speciesName]),
      categoryWeight: {
        [sighting.category]: sighting.intensity,
      },
    });
  }

  return Array.from(grouped.values())
    .map((cluster) => {
      const dominantCategory = Object.entries(cluster.categoryWeight).sort((left, right) => {
        return right[1] - left[1];
      })[0]?.[0];

      return {
        siteId: cluster.siteId,
        siteName: cluster.siteName,
        province: cluster.province,
        ecosystem: cluster.ecosystem,
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        observationCount: cluster.observationCount,
        speciesCount: cluster.speciesNames.size,
        totalIntensity: cluster.totalIntensity,
        dominantCategory: dominantCategory ?? cluster.dominantCategory,
      };
    })
    .sort((left, right) => right.totalIntensity - left.totalIntensity);
}

export function buildCategorySummaries(
  sightings: HeatmapSighting[],
  categories: HeatmapCategory[],
): CategorySummary[] {
  return categories.map((category) => {
    const categorySightings = sightings.filter((sighting) => sighting.category === category.id);
    const sites = new Set(categorySightings.map((sighting) => sighting.siteId));
    const species = new Set(categorySightings.map((sighting) => sighting.speciesName));

    return {
      id: category.id,
      label: category.label,
      color: category.color,
      observationCount: categorySightings.length,
      speciesCount: species.size,
      siteCount: sites.size,
    };
  });
}

export function buildRecentDailyCounts(sightings: HeatmapSighting[], numberOfDays = 6) {
  const counts = new Map<string, number>();

  for (const sighting of sightings) {
    counts.set(sighting.day, (counts.get(sighting.day) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-numberOfDays)
    .map(([day, count]) => ({ day, count }));
}

const HEAT_ZONE_MERGE_DISTANCE_KM = 180;
const EARTH_RADIUS_KM = 6371;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const startLatitude = toRadians(latitudeA);
  const endLatitude = toRadians(latitudeB);
  const haversineTerm =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversineTerm), Math.sqrt(1 - haversineTerm));
}

type WorkingHeatZone = {
  latitudeWeightedSum: number;
  longitudeWeightedSum: number;
  weightSum: number;
  totalIntensity: number;
  observationCount: number;
  speciesNames: Set<string>;
  sightings: HeatmapSighting[];
};

function buildHeatZones(sightings: HeatmapSighting[], snapshotKey: string) {
  if (sightings.length === 0) {
    return [] as HeatmapZone[];
  }

  const zones: WorkingHeatZone[] = [];

  for (const sighting of sightings) {
    let matchedZone: WorkingHeatZone | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const zone of zones) {
      const zoneLatitude = zone.latitudeWeightedSum / zone.weightSum;
      const zoneLongitude = zone.longitudeWeightedSum / zone.weightSum;
      const distance = haversineDistanceKm(
        sighting.latitude,
        sighting.longitude,
        zoneLatitude,
        zoneLongitude,
      );

      if (distance <= HEAT_ZONE_MERGE_DISTANCE_KM && distance < nearestDistance) {
        matchedZone = zone;
        nearestDistance = distance;
      }
    }

    if (!matchedZone) {
      zones.push({
        latitudeWeightedSum: sighting.latitude * sighting.intensity,
        longitudeWeightedSum: sighting.longitude * sighting.intensity,
        weightSum: sighting.intensity,
        totalIntensity: sighting.intensity,
        observationCount: 1,
        speciesNames: new Set([sighting.speciesName]),
        sightings: [sighting],
      });
      continue;
    }

    matchedZone.latitudeWeightedSum += sighting.latitude * sighting.intensity;
    matchedZone.longitudeWeightedSum += sighting.longitude * sighting.intensity;
    matchedZone.weightSum += sighting.intensity;
    matchedZone.totalIntensity += sighting.intensity;
    matchedZone.observationCount += 1;
    matchedZone.speciesNames.add(sighting.speciesName);
    matchedZone.sightings.push(sighting);
  }

  const strongestZoneIntensity = Math.max(...zones.map((zone) => zone.totalIntensity), 1);

  return zones
    .map((zone, index) => {
      const latitude = zone.latitudeWeightedSum / zone.weightSum;
      const longitude = zone.longitudeWeightedSum / zone.weightSum;
      const pointDistances = zone.sightings.map((sighting) =>
        haversineDistanceKm(latitude, longitude, sighting.latitude, sighting.longitude),
      );
      const averageDistanceKm =
        pointDistances.reduce((sum, distance) => sum + distance, 0) / pointDistances.length;
      const farthestDistanceKm = Math.max(...pointDistances, 0);
      const strength = clamp(Math.pow(zone.totalIntensity / strongestZoneIntensity, 0.72), 0.2, 1);
      const spreadMeters = averageDistanceKm * 900 + farthestDistanceKm * 700;
      const outerRadius = clamp(72000 + strength * 98000 + spreadMeters, 72000, 192000);

      return {
        key: `${snapshotKey}-${index}`,
        latitude: roundCoordinate(latitude),
        longitude: roundCoordinate(longitude),
        observationCount: zone.observationCount,
        speciesCount: zone.speciesNames.size,
        totalIntensity: zone.totalIntensity,
        outerRadius,
        middleRadius: outerRadius * 0.62,
        coreRadius: outerRadius * 0.34,
        glowRadius: outerRadius * 0.18,
        strength,
      };
    })
    .sort((left, right) => left.strength - right.strength);
}

export function buildHeatmapDaySnapshots(data: HeatmapPayload): HeatmapDaySnapshot[] {
  const categoryIds = data.categories.map((category) => category.id);
  const categoryIndexById = new Map(categoryIds.map((id, index) => [id, index]));
  const grouped = new Map<
    string,
    HeatmapCluster & {
      speciesNames: Set<string>;
      categoryWeight: Record<string, number>;
    }
  >();
  const distinctSpecies = new Set<string>();
  const categoryObservationCounts = new Array(categoryIds.length).fill(0);
  const visibleSightings: HeatmapSighting[] = [];
  const snapshots: HeatmapDaySnapshot[] = [];
  let sightingIndex = 0;

  for (const day of data.availableDays) {
    let newTodayCount = 0;

    while (sightingIndex < data.sightings.length && data.sightings[sightingIndex].day === day) {
      const sighting = data.sightings[sightingIndex];
      const existing = grouped.get(sighting.siteId);
      const categoryIndex = categoryIndexById.get(sighting.category);

      visibleSightings.push(sighting);
      distinctSpecies.add(sighting.speciesName);
      newTodayCount += 1;

      if (categoryIndex !== undefined) {
        categoryObservationCounts[categoryIndex] += 1;
      }

      if (existing) {
        existing.observationCount += 1;
        existing.totalIntensity += sighting.intensity;
        existing.speciesNames.add(sighting.speciesName);
        existing.categoryWeight[sighting.category] =
          (existing.categoryWeight[sighting.category] ?? 0) + sighting.intensity;
      } else {
        grouped.set(sighting.siteId, {
          siteId: sighting.siteId,
          siteName: sighting.siteName,
          province: sighting.province,
          ecosystem: sighting.ecosystem,
          latitude: sighting.latitude,
          longitude: sighting.longitude,
          observationCount: 1,
          speciesCount: 1,
          totalIntensity: sighting.intensity,
          dominantCategory: sighting.category,
          speciesNames: new Set([sighting.speciesName]),
          categoryWeight: {
            [sighting.category]: sighting.intensity,
          },
        });
      }

      sightingIndex += 1;
    }

    if (newTodayCount === 0 && snapshots.length > 0) {
      const previousSnapshot = snapshots[snapshots.length - 1];
      snapshots.push({
        day,
        newTodayCount,
        visibleSightingsCount: previousSnapshot.visibleSightingsCount,
        distinctSpeciesCount: previousSnapshot.distinctSpeciesCount,
        topHotspot: previousSnapshot.topHotspot,
        categoryObservationCounts: previousSnapshot.categoryObservationCounts,
        heatZones: previousSnapshot.heatZones,
      });
      continue;
    }

    const baseHotspots = Array.from(grouped.values())
      .map((cluster) => {
        const dominantCategory = Object.entries(cluster.categoryWeight).sort((left, right) => {
          return right[1] - left[1];
        })[0]?.[0];

        return {
          siteId: cluster.siteId,
          siteName: cluster.siteName,
          province: cluster.province,
          ecosystem: cluster.ecosystem,
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          observationCount: cluster.observationCount,
          speciesCount: cluster.speciesNames.size,
          totalIntensity: cluster.totalIntensity,
          dominantCategory: dominantCategory ?? cluster.dominantCategory,
        };
      })
      .sort((left, right) => right.totalIntensity - left.totalIntensity);

    const categoryObservationCountMap = categoryIds.reduce<Record<string, number>>(
      (accumulator, id, index) => {
        accumulator[id] = categoryObservationCounts[index];
        return accumulator;
      },
      {},
    );

    snapshots.push({
      day,
      newTodayCount,
      visibleSightingsCount: sightingIndex,
      distinctSpeciesCount: distinctSpecies.size,
      topHotspot: baseHotspots[0],
      categoryObservationCounts: categoryObservationCountMap,
      heatZones: buildHeatZones(visibleSightings, day),
    });
  }

  return snapshots;
}
