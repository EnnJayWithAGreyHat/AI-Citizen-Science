import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles from './MyGarden.styles';

// ─── Types ───────────────────────────────────────────────────────────────────

type HabitatState = 'locked' | 'sprouting' | 'blooming' | 'thriving';

interface HabitatCard {
  key: string;
  label: string;
  icon: string;
  description: string;
  distinctTaxa: number;
  totalObservations: number;
  nextMilestone: number;
}

interface JournalEntry {
  id: string;
  name: string;
  habitat: string;
  date: string;
  verified?: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const HABITATS: HabitatCard[] = [
  {
    key: 'plants',
    label: 'Meadow',
    icon: '🌿',
    description: 'Wild grasses, blooms, and leafy life.',
    distinctTaxa: 6,
    totalObservations: 12,
    nextMilestone: 10,
  },
  {
    key: 'insects',
    label: 'Pollinator Patch',
    icon: '🦋',
    description: 'Bees, butterflies, and tiny workers.',
    distinctTaxa: 3,
    totalObservations: 7,
    nextMilestone: 5,
  },
  {
    key: 'birds',
    label: 'Bird Grove',
    icon: '🐦',
    description: 'Song, flight, and feathered visitors.',
    distinctTaxa: 4,
    totalObservations: 8,
    nextMilestone: 7,
  },
  {
    key: 'mammals',
    label: 'Night Nook',
    icon: '🦊',
    description: 'Quiet tracks and twilight roamers.',
    distinctTaxa: 2,
    totalObservations: 3,
    nextMilestone: 5,
  },
];

const RECENT: JournalEntry[] = [
  { id: 'j-1', name: 'Monarch Butterfly', habitat: 'Pollinator Patch', date: 'Mar 28', verified: true },
  { id: 'j-2', name: 'Mallard', habitat: 'Bird Grove', date: 'Mar 26' },
  { id: 'j-3', name: 'Coast Live Oak', habitat: 'Meadow', date: 'Mar 25' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const computeState = (distinctTaxa: number, nextMilestone: number): HabitatState => {
  if (distinctTaxa === 0) return 'locked';
  if (distinctTaxa < Math.ceil(nextMilestone * 0.4)) return 'sprouting';
  if (distinctTaxa < Math.ceil(nextMilestone * 0.8)) return 'blooming';
  return 'thriving';
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyGarden() {
  const totalObservations = sum(HABITATS.map((habitat) => habitat.totalObservations));
  const totalDistinct = sum(HABITATS.map((habitat) => habitat.distinctTaxa));
  const habitatsUnlocked = HABITATS.filter((habitat) => habitat.distinctTaxa > 0).length;
  const overallProgress = Math.min(
    100,
    Math.round(
      sum(
        HABITATS.map((habitat) =>
          Math.min(1, habitat.distinctTaxa / Math.max(1, habitat.nextMilestone)),
        ),
      ) /
        HABITATS.length *
        100,
    ),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>My Garden</Text>
        <Text style={styles.heroTitle}>Grow a living sanctuary with every wildlife discovery.</Text>
        <Text style={styles.heroCopy}>
          Each unique taxon you log brings your habitats to life. Track your life list, watch each
          zone level up, and keep a field journal of your latest sightings.
        </Text>
        <View style={styles.heroBadgeRow}>
          <Text style={[styles.badge, styles.badgeDemo]}>Demo data</Text>
          <Text style={[styles.badge, styles.badgeSignedOut]}>Sign in to personalize</Text>
        </View>
        <View style={styles.heroProgressCard}>
          <Text style={styles.heroProgressLabel}>Sanctuary Growth</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={styles.heroProgressMeta}>{overallProgress}% thriving</Text>
          <Text style={styles.heroProgressMeta}>{totalDistinct} distinct taxa</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Observations</Text>
          <Text style={styles.summaryValue}>{totalObservations}</Text>
          <Text style={styles.summaryMeta}>Uploads and repeats included</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Distinct Taxa</Text>
          <Text style={styles.summaryValue}>{totalDistinct}</Text>
          <Text style={styles.summaryMeta}>Life-list discoveries</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Habitats Unlocked</Text>
          <Text style={styles.summaryValue}>{habitatsUnlocked}</Text>
          <Text style={styles.summaryMeta}>Zones now active</Text>
        </View>
      </View>

      {/* Habitats */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Habitat Board</Text>
        <Text style={styles.sectionSubtitle}>
          Each habitat levels up with distinct taxa. Repeats count toward total observations but do
          not inflate progress.
        </Text>
      </View>
      <View style={styles.habitatGrid}>
        {HABITATS.map((habitat) => {
          const state = computeState(habitat.distinctTaxa, habitat.nextMilestone);
          const percent = Math.min(
            100,
            Math.round((habitat.distinctTaxa / Math.max(1, habitat.nextMilestone)) * 100),
          );

          return (
            <View key={habitat.key} style={styles.habitatCard}>
              <View style={styles.habitatHeader}>
                <View style={styles.habitatTitleRow}>
                  <Text style={styles.habitatIcon}>{habitat.icon}</Text>
                  <View>
                    <Text style={styles.habitatName}>{habitat.label}</Text>
                    <Text style={styles.habitatState}>{state}</Text>
                  </View>
                </View>
                <Text style={styles.habitatDescription}>{habitat.description}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <View style={styles.habitatStatsRow}>
                <Text style={styles.habitatStat}>{habitat.distinctTaxa} distinct taxa</Text>
                <Text style={styles.habitatStat}>{habitat.totalObservations} observations</Text>
              </View>
              <Text style={styles.habitatNext}>
                {habitat.nextMilestone - habitat.distinctTaxa} more to reach {habitat.nextMilestone}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Journal */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Field Journal</Text>
        <Text style={styles.sectionSubtitle}>
          Recent discoveries keep your garden grounded in real observations.
        </Text>
      </View>
      <View style={styles.journalList}>
        {RECENT.map((entry) => (
          <View key={entry.id} style={styles.journalItem}>
            <Text style={styles.journalName}>{entry.name}</Text>
            <View style={styles.journalMetaRow}>
              <Text style={styles.journalHabitat}>{entry.habitat}</Text>
              <Text style={styles.journalDate}>{entry.date}</Text>
              {entry.verified && <Text style={styles.journalBadge}>Verified</Text>}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => {}}>
        <Text style={styles.primaryButtonText}>Log a New Observation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
