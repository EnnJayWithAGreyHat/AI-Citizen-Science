import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildCategorySummaries,
  buildRecentDailyCounts,
  findLeadingProvince,
  formatCompactDay,
  formatDayLabel,
  getDistinctSpeciesCount,
  getVisibleSightings,
  groupSightingsBySite,
  HeatmapPayload,
  loadHeatmapData,
} from './heatmapData';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: HeatmapPayload; sourceLabel: string; notice?: string }
  | { status: 'error'; message: string };

export default function BiodiversityAnalytics() {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      setLoadState({ status: 'loading' });

      try {
        const payload = await loadHeatmapData();
        if (isCancelled) {
          return;
        }

        setLoadState({
          status: 'ready',
          data: payload.data,
          sourceLabel: payload.sourceLabel,
          notice: payload.notice,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load analytics data.',
        });
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [refreshTick]);

  if (loadState.status === 'loading') {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator size="large" color="#295244" />
        <Text style={styles.stateTitle}>Loading biodiversity analytics</Text>
        <Text style={styles.stateCopy}>
          Building the category, hotspot, and daily upload summaries for Indonesia.
        </Text>
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.errorTitle}>Analytics could not be loaded</Text>
        <Text style={styles.stateCopy}>{loadState.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => setRefreshTick((value) => value + 1)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const { data } = loadState;
  const latestDay = data.availableDays[data.availableDays.length - 1];
  const visibleSightings = getVisibleSightings(data.sightings, latestDay, selectedCategory);
  const hotspotRows = groupSightingsBySite(visibleSightings).slice(0, 5);
  const categorySummaries = buildCategorySummaries(
    getVisibleSightings(data.sightings, latestDay),
    data.categories,
  );
  const recentDailyCounts = buildRecentDailyCounts(visibleSightings);
  const speciesCount = getDistinctSpeciesCount(visibleSightings);
  const leadingProvince = findLeadingProvince(visibleSightings);
  const activeSites = new Set(visibleSightings.map((sighting) => sighting.siteId)).size;
  const highestDailyCount = Math.max(...recentDailyCounts.map((entry) => entry.count), 1);
  const selectedCategoryLabel =
    selectedCategory === 'all'
      ? 'All findings'
      : data.categories.find((category) => category.id === selectedCategory)?.label ?? 'Selected';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Biodiversity analytics</Text>
        <Text style={styles.heroTitle}>A simplified sponsor dashboard for the Indonesia dataset.</Text>
        <Text style={styles.heroCopy}>
          This page separates the numbers from the map. Use it to explain what categories are
          strongest, where activity is clustering, and how uploads are accumulating over time.
        </Text>
        <Text style={styles.heroMeta}>
          Current snapshot: {selectedCategoryLabel} through {formatDayLabel(latestDay)}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === 'all' && styles.filterChipTextActive,
            ]}
          >
            All findings
          </Text>
        </Pressable>
        {data.categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              style={[
                styles.filterChip,
                isActive && {
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextOnColor]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Visible uploads</Text>
          <Text style={styles.summaryValue}>{visibleSightings.length}</Text>
          <Text style={styles.summaryMeta}>Cumulative through the latest day</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Distinct species</Text>
          <Text style={styles.summaryValue}>{speciesCount}</Text>
          <Text style={styles.summaryMeta}>Within the selected category scope</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active sites</Text>
          <Text style={styles.summaryValue}>{activeSites}</Text>
          <Text style={styles.summaryMeta}>Locations currently contributing to the map</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Leading province</Text>
          <Text style={styles.summaryValue}>{leadingProvince}</Text>
          <Text style={styles.summaryMeta}>Highest upload count in the selected view</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category distribution</Text>
          <Text style={styles.sectionSubtitle}>
            All categories shown across the latest cumulative dataset.
          </Text>
        </View>
        {categorySummaries.map((summary) => {
          const maxCategoryCount = Math.max(...categorySummaries.map((item) => item.observationCount), 1);
          const width = `${Math.max((summary.observationCount / maxCategoryCount) * 100, 6)}%` as const;

          return (
            <View key={summary.id} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{summary.label}</Text>
                <Text style={styles.categoryMeta}>
                  {summary.observationCount} uploads · {summary.speciesCount} species · {summary.siteCount}{' '}
                  sites
                </Text>
              </View>
              <View style={styles.categoryTrack}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width,
                      backgroundColor: summary.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent upload cadence</Text>
          <Text style={styles.sectionSubtitle}>
            The last few active observation days for the selected category filter.
          </Text>
        </View>
        <View style={styles.dailyGrid}>
          {recentDailyCounts.length === 0 ? (
            <Text style={styles.emptyText}>No uploads are visible for this category yet.</Text>
          ) : (
            recentDailyCounts.map((entry) => (
              <View key={entry.day} style={styles.dailyCard}>
                <Text style={styles.dailyLabel}>{formatCompactDay(entry.day)}</Text>
                <View style={styles.dailyTrack}>
                  <View
                    style={[
                      styles.dailyFill,
                      { width: `${(entry.count / highestDailyCount) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.dailyCount}>{entry.count} uploads</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hotspot leaderboard</Text>
          <Text style={styles.sectionSubtitle}>
            The strongest sites in the current analytics filter.
          </Text>
        </View>
        {hotspotRows.map((hotspot, index) => (
          <View key={hotspot.siteId} style={styles.hotspotRow}>
            <View style={styles.hotspotIndex}>
              <Text style={styles.hotspotIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.hotspotBody}>
              <Text style={styles.hotspotTitle}>{hotspot.siteName}</Text>
              <Text style={styles.hotspotMeta}>
                {hotspot.province} · {hotspot.ecosystem}
              </Text>
            </View>
            <View style={styles.hotspotStatGroup}>
              <Text style={styles.hotspotStatValue}>{hotspot.observationCount}</Text>
              <Text style={styles.hotspotStatLabel}>uploads</Text>
            </View>
            <View style={styles.hotspotStatGroup}>
              <Text style={styles.hotspotStatValue}>{hotspot.speciesCount}</Text>
              <Text style={styles.hotspotStatLabel}>species</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerSource}>Source: {loadState.sourceLabel}</Text>
        {loadState.notice ? <Text style={styles.footerNotice}>Fallback demo snapshot active</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EEE4',
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  stateScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#F3EEE4',
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F4035',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C3733',
  },
  stateCopy: {
    marginTop: 8,
    maxWidth: 420,
    textAlign: 'center',
    lineHeight: 20,
    color: '#65736A',
  },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#1F4035',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#18372D',
  },
  heroEyebrow: {
    color: '#A5D3BB',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#F8F3E8',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  heroCopy: {
    marginTop: 10,
    color: '#DAE7DE',
    lineHeight: 20,
  },
  heroMeta: {
    marginTop: 10,
    color: '#B7D5C5',
    fontWeight: '600',
  },
  filterRow: {
    gap: 10,
    paddingRight: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D2C7B5',
    backgroundColor: '#F8F2E7',
  },
  filterChipActive: {
    backgroundColor: '#1F4035',
    borderColor: '#1F4035',
  },
  filterChipText: {
    color: '#29493C',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#F8F3E8',
  },
  filterChipTextOnColor: {
    color: '#FFF9F0',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  summaryCard: {
    flexBasis: 220,
    flexGrow: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#DED5C5',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6D7A71',
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F4035',
  },
  summaryMeta: {
    marginTop: 6,
    lineHeight: 18,
    color: '#67746C',
  },
  sectionCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#DED5C5',
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F4035',
  },
  sectionSubtitle: {
    color: '#6B776F',
    lineHeight: 19,
  },
  categoryRow: {
    gap: 8,
  },
  categoryHeader: {
    gap: 4,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24473B',
  },
  categoryMeta: {
    color: '#6D7870',
  },
  categoryTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#ECE4D6',
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    borderRadius: 999,
  },
  dailyGrid: {
    gap: 12,
  },
  dailyCard: {
    gap: 6,
  },
  dailyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#29493C',
  },
  dailyTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E9E2D4',
    overflow: 'hidden',
  },
  dailyFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2E5A4B',
  },
  dailyCount: {
    color: '#6D7971',
    fontSize: 12,
  },
  emptyText: {
    color: '#6D7971',
    lineHeight: 19,
  },
  hotspotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE3D6',
  },
  hotspotIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EEE8',
  },
  hotspotIndexText: {
    color: '#24473B',
    fontWeight: '700',
  },
  hotspotBody: {
    flex: 1,
  },
  hotspotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24473B',
  },
  hotspotMeta: {
    marginTop: 4,
    color: '#6E7972',
  },
  hotspotStatGroup: {
    width: 70,
    alignItems: 'flex-end',
  },
  hotspotStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24473B',
  },
  hotspotStatLabel: {
    fontSize: 11,
    color: '#75827A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  footerCard: {
    marginTop: -4,
    paddingHorizontal: 4,
    gap: 4,
  },
  footerSource: {
    color: '#6B776F',
    fontSize: 12,
  },
  footerNotice: {
    color: '#7D6648',
    fontSize: 12,
    fontWeight: '600',
  },
});
