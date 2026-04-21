import Slider from '@react-native-community/slider';
import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, LatLng } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildHeatmapDaySnapshots,
  formatCompactDay,
  formatDayLabel,
  HeatmapDaySnapshot,
  HeatmapPayload,
  loadHeatmapData,
  rgbaFromHex,
} from './heatmapData';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: HeatmapPayload; sourceLabel: string; notice?: string }
  | { status: 'error'; message: string };

const INDONESIA_VIEWPORT = {
  latitude: -2.2,
  longitude: 118.0,
  latitudeDelta: 19.5,
  longitudeDelta: 53,
};

const EMPTY_SNAPSHOT: HeatmapDaySnapshot = {
  day: '',
  newTodayCount: 0,
  visibleSightingsCount: 0,
  distinctSpeciesCount: 0,
  categoryObservationCounts: {},
  heatZones: [],
};

export default function BiodiversityHeatmap() {
  const mapRef = useRef<MapView | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedAtRef = useRef(0);
  const pendingSliderIndexRef = useRef(0);
  const insets = useSafeAreaInsets();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [sliderDayIndex, setSliderDayIndex] = useState(0);
  const [committedDayIndex, setCommittedDayIndex] = useState(0);
  const [mapReady, setMapReady] = useState(false);
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

        const initialIndex = Math.max(payload.data.availableDays.length - 1, 0);
        pendingSliderIndexRef.current = initialIndex;
        lastCommittedAtRef.current = 0;
        if (commitTimerRef.current) {
          clearTimeout(commitTimerRef.current);
          commitTimerRef.current = null;
        }

        setSliderDayIndex(initialIndex);
        setCommittedDayIndex(initialIndex);
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
          message: error instanceof Error ? error.message : 'Unable to load heat map data.',
        });
      }
    };

    run();

    return () => {
      isCancelled = true;
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
      }
    };
  }, [refreshTick]);

  const queueCommittedDayIndex = (nextIndex: number, immediate = false) => {
    pendingSliderIndexRef.current = nextIndex;

    if (immediate) {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
      lastCommittedAtRef.current = Date.now();
      startTransition(() => {
        setCommittedDayIndex(nextIndex);
      });
      return;
    }

    const now = Date.now();
    const elapsed = now - lastCommittedAtRef.current;
    const minInterval = 80;

    if (elapsed >= minInterval && !commitTimerRef.current) {
      lastCommittedAtRef.current = now;
      startTransition(() => {
        setCommittedDayIndex(nextIndex);
      });
      return;
    }

    if (commitTimerRef.current) {
      return;
    }

    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = null;
      lastCommittedAtRef.current = Date.now();
      const pendingIndex = pendingSliderIndexRef.current;
      startTransition(() => {
        setCommittedDayIndex(pendingIndex);
      });
    }, Math.max(minInterval - elapsed, 16));
  };

  const handleSliderValueChange = (value: number) => {
    const nextIndex = Math.round(value);

    setSliderDayIndex((currentIndex) => {
      return currentIndex === nextIndex ? currentIndex : nextIndex;
    });
    queueCommittedDayIndex(nextIndex);
  };

  const handleSliderComplete = (value: number) => {
    const nextIndex = Math.round(value);
    pendingSliderIndexRef.current = nextIndex;
    setSliderDayIndex(nextIndex);
    queueCommittedDayIndex(nextIndex, true);
  };

  const readyState = loadState.status === 'ready' ? loadState : null;
  const daySnapshots = useMemo(() => {
    if (!readyState) {
      return [] as HeatmapDaySnapshot[];
    }

    return buildHeatmapDaySnapshots(readyState.data);
  }, [readyState]);
  const allCoordinates = useMemo(() => {
    if (!readyState) {
      return [] as LatLng[];
    }

    return readyState.data.sightings.map((sighting) => ({
      latitude: sighting.latitude,
      longitude: sighting.longitude,
    }));
  }, [readyState]);
  const visibleDayIndex = useDeferredValue(committedDayIndex);

  useEffect(() => {
    if (!readyState || !mapReady) {
      return;
    }

    const fitTimer = setTimeout(() => {
      if (allCoordinates.length === 0) {
        return;
      }

      mapRef.current?.fitToCoordinates(allCoordinates, {
        animated: false,
        edgePadding: {
          top: 72 + insets.top,
          right: 42,
          bottom: 240 + insets.bottom,
          left: 42,
        },
      });
    }, 220);

    return () => clearTimeout(fitTimer);
  }, [allCoordinates, insets.bottom, insets.top, mapReady, readyState]);

  if (loadState.status === 'loading') {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator size="large" color="#275042" />
        <Text style={styles.stateTitle}>Loading Indonesia biodiversity heat map</Text>
        <Text style={styles.stateCopy}>
          Preparing the daily sponsor demo timeline and radial biodiversity hotspots.
        </Text>
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.errorTitle}>Map data could not be loaded</Text>
        <Text style={styles.stateCopy}>{loadState.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => setRefreshTick((value) => value + 1)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const { data } = loadState;
  const activeSnapshot =
    daySnapshots[visibleDayIndex] ?? daySnapshots[daySnapshots.length - 1] ?? EMPTY_SNAPSHOT;
  const selectedDay = activeSnapshot.day || data.availableDays[0];
  const sliderLabelDay = data.availableDays[sliderDayIndex] ?? selectedDay;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INDONESIA_VIEWPORT}
        moveOnMarkerPress={false}
        onMapReady={() => setMapReady(true)}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {activeSnapshot.heatZones.map((zone) => (
          <Circle
            key={`${zone.key}-outer`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            fillColor={rgbaFromHex('#FFE35B', 0.08 + zone.strength * 0.16)}
            radius={zone.outerRadius}
            strokeColor="transparent"
            strokeWidth={0}
          />
        ))}
        {activeSnapshot.heatZones.map((zone) => (
          <Circle
            key={`${zone.key}-middle`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            fillColor={rgbaFromHex('#FFAA2D', 0.12 + zone.strength * 0.18)}
            radius={zone.middleRadius}
            strokeColor="transparent"
            strokeWidth={0}
          />
        ))}
        {activeSnapshot.heatZones.map((zone) => (
          <Circle
            key={`${zone.key}-core`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            fillColor={rgbaFromHex('#FF6330', 0.18 + zone.strength * 0.22)}
            radius={zone.coreRadius}
            strokeColor="transparent"
            strokeWidth={0}
          />
        ))}
        {activeSnapshot.heatZones.map((zone) => (
          <Circle
            key={`${zone.key}-glow`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            fillColor={rgbaFromHex('#DF2F27', 0.24 + zone.strength * 0.24)}
            radius={zone.glowRadius}
            strokeColor="transparent"
            strokeWidth={0}
          />
        ))}
      </MapView>

      <View style={[styles.topOverlay, { top: 14 + insets.top }]}>
        <View style={styles.heroChip}>
          <Text style={styles.heroChipText}>Indonesia heat map</Text>
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.heroDate}>{formatDayLabel(selectedDay)}</Text>
          <Text style={styles.heroMeta}>
            {activeSnapshot.newTodayCount} new uploads today | {activeSnapshot.visibleSightingsCount}{' '}
            visible | {activeSnapshot.distinctSpeciesCount} species
          </Text>
          {activeSnapshot.topHotspot ? (
            <Text style={styles.heroHotspot}>
              Strongest hotspot: {activeSnapshot.topHotspot.siteName}, {activeSnapshot.topHotspot.province}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderHeaderCopy}>
            <Text style={styles.sliderTitle}>Day-by-day timeline</Text>
            <Text style={styles.sliderMeta}>
              Drag the bar to move through the dataset one day at a time.
            </Text>
          </View>
          <Pressable style={styles.refreshChip} onPress={() => setRefreshTick((value) => value + 1)}>
            <Text style={styles.refreshChipText}>Refresh</Text>
          </Pressable>
        </View>

        <Slider
          maximumTrackTintColor="#C8D3CE"
          maximumValue={data.availableDays.length - 1}
          minimumTrackTintColor="#275042"
          minimumValue={0}
          onSlidingComplete={handleSliderComplete}
          onValueChange={handleSliderValueChange}
          step={1}
          style={styles.slider}
          thumbTintColor="#1F4035"
          value={sliderDayIndex}
        />

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{formatCompactDay(data.availableDays[0])}</Text>
          <Text style={styles.sliderLabel}>{formatCompactDay(sliderLabelDay)}</Text>
          <Text style={styles.sliderLabel}>
            {formatCompactDay(data.availableDays[data.availableDays.length - 1])}
          </Text>
        </View>

        <View style={styles.scaleHeader}>
          <Text style={styles.legendTitle}>Heat intensity</Text>
          <View style={styles.scaleRow}>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleSwatch, { backgroundColor: '#FFE35B' }]} />
              <Text style={styles.scaleLabel}>Lower</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleSwatch, { backgroundColor: '#FFAA2D' }]} />
              <Text style={styles.scaleLabel}>Medium</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleSwatch, { backgroundColor: '#DF2F27' }]} />
              <Text style={styles.scaleLabel}>Higher</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendHeader}>
          <Text style={styles.legendTitle}>Observation legend</Text>
          <Text style={styles.legendSubtitle}>
            Warm circles show concentration. These swatches show which wildlife categories are present.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendRow}
        >
          {data.categories.map((category) => {
            const observationCount = activeSnapshot.categoryObservationCounts[category.id] ?? 0;
            return (
              <View key={category.id} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: category.color }]} />
                <View style={styles.legendCopy}>
                  <Text style={styles.legendLabel}>{category.label}</Text>
                  <Text style={styles.legendValue}>{observationCount} observed</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{loadState.sourceLabel}</Text>
          {sliderDayIndex !== visibleDayIndex ? (
            <Text style={styles.footerNotice}>Updating map...</Text>
          ) : loadState.notice ? (
            <Text style={styles.footerNotice}>Fallback demo snapshot active</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D7E2E0',
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
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B3532',
    textAlign: 'center',
  },
  stateCopy: {
    marginTop: 8,
    maxWidth: 420,
    textAlign: 'center',
    lineHeight: 20,
    color: '#617067',
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
  topOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 10,
  },
  heroChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 39, 32, 0.88)',
  },
  heroChipText: {
    color: '#F7F2E7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(250, 246, 236, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(166, 182, 172, 0.42)',
  },
  heroDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18352B',
  },
  heroMeta: {
    marginTop: 6,
    lineHeight: 20,
    color: '#5A6B62',
  },
  heroHotspot: {
    marginTop: 6,
    color: '#315648',
    fontWeight: '600',
  },
  bottomPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(250, 246, 236, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(166, 182, 172, 0.42)',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  sliderHeaderCopy: {
    flex: 1,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F4035',
  },
  sliderMeta: {
    marginTop: 4,
    color: '#637169',
    lineHeight: 18,
  },
  refreshChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E5ECE8',
  },
  refreshChipText: {
    color: '#234739',
    fontWeight: '700',
  },
  slider: {
    marginTop: 10,
    marginHorizontal: -8,
    height: 36,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    color: '#52635B',
    fontSize: 12,
    fontWeight: '600',
  },
  legendHeader: {
    marginTop: 12,
    gap: 4,
  },
  scaleHeader: {
    marginTop: 12,
    gap: 8,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scaleSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scaleLabel: {
    color: '#5B6B63',
    fontSize: 12,
    fontWeight: '600',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F4035',
  },
  legendSubtitle: {
    color: '#637169',
    fontSize: 12,
    lineHeight: 17,
  },
  legendRow: {
    gap: 10,
    paddingRight: 12,
    marginTop: 10,
  },
  legendItem: {
    minWidth: 138,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F2ECE1',
    borderWidth: 1,
    borderColor: '#DDD1BF',
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendCopy: {
    gap: 2,
  },
  legendLabel: {
    color: '#254539',
    fontWeight: '700',
    fontSize: 13,
  },
  legendValue: {
    color: '#6C7970',
    fontSize: 12,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerText: {
    color: '#6E7D76',
    fontSize: 12,
  },
  footerNotice: {
    color: '#7B6649',
    fontSize: 12,
    fontWeight: '600',
  },
});
