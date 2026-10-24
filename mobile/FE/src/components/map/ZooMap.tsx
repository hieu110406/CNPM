import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Pressable from '@/components/ui/AnimatedPressable';
import Animated from 'react-native-reanimated';
import { fadeIn, slideIn } from '@/components/ui/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapCanvas, { type MapCanvasHandle, type MapMarker } from './MapCanvas';
import { getMapPois, type MapNode } from '@/api/map';
import { buildGraph, shortestPath, type MapGraphPath } from '../../../../../app/FE/src/components/map/mapGraph';
import { useI18n, type TranslationKey } from '@/context/I18nContext';
import { normalizeSearch } from '@/utils/search';
import { appearance as a } from '@/constants/appearance';
import AppIcon from '@/components/ui/AppIcon';
import PoiAudioControl from '@/components/audio/PoiAudioControl';
import AnimalThumbnail from '@/components/ui/AnimalThumbnail';
import AnimalDetailPopup from '@/components/explore/AnimalDetailPopup';
import useGpsSimulation from './useGpsSimulation';
import { gpsToMapCoordinates, mapToGpsCoordinates } from '@/utils/gpsMapCalibration';

const CURRENT_LOCATION_ID = 'current_location';

const GPS_FIXED_ANCHORS = [
  {
    latitude: 10.787343,
    longitude: 106.705036,
    x: 41.5,
    y: 91.5,
  },
  {
    latitude: 10.78894312781009,
    longitude: 106.70714945167893,
    x: 57.3,
    y: 40.1,
  },
  {
    latitude: 10.788099697238112,
    longitude: 106.70601961019264,
    x: 43.9,
    y: 64.2,
  },
];

const GPS_ZEBRA_ANCHOR = {
  id: 'zebra',
  match: ['ngua van', 'zebra', '斑马'],
  latitude: 10.78869726716698,
  longitude: 106.70467729870951,
};

type DeviceMapLocation = {
  node: MapNode;
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

const mapZoneFilters: { value: string; key: TranslationKey }[] = [
  { value: 'all', key: 'all' },
  { value: 'animal', key: 'mapAnimals' },
  { value: 'building', key: 'mapBuildings' },
  { value: 'service', key: 'mapServices' },
];

function markerEmoji(category: string) {
  return ({ animal: '🐾', building: '🏛️', service: '🚋', restaurant: '🍴', restroom: '🚻',
    medical: '🏥', plant: '🌿', photo: '📷', entertainment: '🎡' } as Record<string, string>)[category] || '📍';
}

export default function ZooMap() {
  const { poiId } = useLocalSearchParams<{ poiId?: string }>();
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const map = useRef<MapCanvasHandle>(null);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('all');
  const [selected, setSelected] = useState<MapNode | null>(null);
  const [detailPoi, setDetailPoi] = useState<MapNode | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [routeStartId, setRouteStartId] = useState<string>('gate_main');
  const [routeEndId, setRouteEndId] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<MapGraphPath | null>(null);
  const [routeError, setRouteError] = useState('');
  const [points, setPoints] = useState<MapNode[]>([]);
  const gpsAnchors = useMemo(() => {
    const zebraPoi = points.find(point => {
        const id = normalizeSearch(point.id);
        const name = normalizeSearch(point.name);
        return id.includes(GPS_ZEBRA_ANCHOR.id) || GPS_ZEBRA_ANCHOR.match.some(match => {
          const normalizedMatch = normalizeSearch(match);
          return id.includes(normalizedMatch) || name.includes(normalizedMatch);
        });
      });
    if (!zebraPoi) return [];
    return [
        ...GPS_FIXED_ANCHORS.map(anchor => ({
          latitude: anchor.latitude,
          longitude: anchor.longitude,
          x: anchor.x,
          y: anchor.y,
        })),
        {
          latitude: GPS_ZEBRA_ANCHOR.latitude,
          longitude: GPS_ZEBRA_ANCHOR.longitude,
          x: zebraPoi.x,
          y: zebraPoi.y,
        },
      ];
  }, [points]);
  const simulation = useGpsSimulation(gpsAnchors);
  const simulatedCoordinates = simulation.gps
    ? gpsToMapCoordinates(simulation.gps.latitude, simulation.gps.longitude, gpsAnchors) : null;
  const simulatedNode: MapNode | null = simulatedCoordinates ? {
    id: CURRENT_LOCATION_ID, name: t('gpsSimulation'), category: 'current_location', ...simulatedCoordinates,
  } : null;
  const [location, setLocation] = useState<DeviceMapLocation | null>(null);
  const locationRef = useRef<DeviceMapLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [pointsError, setPointsError] = useState(false);
  const pointsVersion = useRef(0);
  const items = useMemo(() => points.filter(item => (zone === 'all' || item.category === zone) &&
    normalizeSearch(item.name).includes(normalizeSearch(query))), [points, zone, query]);
  const activeLocationNode = simulation.active ? simulatedNode : location?.node;
  const routePoints = activeLocationNode ? [...points, activeLocationNode] : points;
  const mapMarkers: MapMarker[] = [
    ...(routeMode ? points : items).map(point => ({
      id: point.id, title: point.name, emoji: point.emoji || markerEmoji(point.category),
      x: point.x, y: point.y, color: point.id === 'gate_main' ? '#397C63' : '#205E48',
    })),
    ...(activeLocationNode ? [{
      id: activeLocationNode.id, title: simulatedNode ? t('gpsSimulation') : t('myLocation'), emoji: '●',
      x: activeLocationNode.x, y: activeLocationNode.y, color: '#2563EB',
    }] : []),
  ];

  const loadPoints = useCallback(async () => {
    const version = ++pointsVersion.current;
    setRouteResult(null);
    setRouteError('');
    setSelected(null);
    setLoadingPoints(true);
    setPointsError(false);
    try {
      const nodes = await getMapPois(language);
      if (version !== pointsVersion.current) return;
      buildGraph([...nodes, ...(locationRef.current ? [locationRef.current.node] : [])]);
      setPoints(nodes);
      if (poiId) {
        setSelected(nodes.find(node => node.id === poiId) ?? null);
        setExpanded(true);
        setRouteMode(false);
      }
      setRouteStartId(locationRef.current?.node.id || nodes.find(node => node.id === 'gate_main')?.id || nodes[0]?.id || '');
      setRouteEndId(null);
      setRouteResult(null);
    } catch {
      if (version === pointsVersion.current) setPointsError(true);
    } finally {
      if (version === pointsVersion.current) setLoadingPoints(false);
    }
  }, [language, poiId]);

  function clearRoute() {
    setRouteResult(null);
    setRouteError('');
  }

  useFocusEffect(useCallback(() => {
    void loadPoints();
    setExpanded(false);
    return () => { pointsVersion.current++; setDetailPoi(null); };
  }, [loadPoints]));

  function startRouteMode(destinationId?: string) {
    Keyboard.dismiss();
    setRouteMode(true);
    setRouteStartId(activeLocationNode?.id || points.find(point => point.id !== destinationId)?.id || '');
    setRouteEndId(destinationId || null);
    clearRoute();
    setExpanded(true);
    map.current?.reset();
  }

  function leaveRouteMode() {
    setRouteMode(false);
    clearRoute();
  }

  function selectRoutePoint(kind: 'start' | 'end', id: string) {
    Keyboard.dismiss();
    if (kind === 'start') {
      setRouteStartId(id);
      if (id === routeEndId) setRouteEndId(null);
    } else {
      setRouteEndId(id);
      if (id === routeStartId) setRouteStartId('');
    }
    clearRoute();
  }

  function findRoute() {
    Keyboard.dismiss();
    if (!routeStartId || !routeEndId) {
      setRouteError(t('routeSelectPoints'));
      return;
    }
    if (routeStartId === routeEndId) {
      setRouteError(t('routeDifferentPoints'));
      return;
    }
    buildGraph(routePoints);
    const result = shortestPath(routeStartId, routeEndId);
    setRouteResult(result);
    setRouteError(result ? '' : t('routeNotFound'));
    if (result) setExpanded(false);
  }

  function startSimulation() {
    const demo = routeResult?.path.length ? routeResult.path : shortestPath('w47', 'w16')?.path;
    if (!demo || demo.length < 2) return;
    if (!mapToGpsCoordinates(demo[0].x, demo[0].y, gpsAnchors)) {
      setLocationError(t('locationCalibrationMissing'));
      return;
    }
    simulation.start(demo);
    setLocationError('');
    setExpanded(false);
    map.current?.reset();
  }

  async function locateMe() {
    setLocationLoading(true);
    setLocationError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError(t('locationPermissionDenied'));
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (gpsAnchors.length < 4) {
        setLocationError(t('locationCalibrationMissing'));
        return;
      }

      const coordinates = gpsToMapCoordinates(current.coords.latitude, current.coords.longitude, gpsAnchors);
      if (!coordinates) {
        setLocationError(t('locationOutsideMap'));
        return;
      }

      const node: MapNode = {
        id: CURRENT_LOCATION_ID,
        name: t('myLocation'),
        x: coordinates.x,
        y: coordinates.y,
        category: 'current_location',
      };
      const nextLocation = {
        node,
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
      };
      locationRef.current = nextLocation;
      setLocation(nextLocation);
      buildGraph([...points, node]);
      if (routeMode) {
        setRouteStartId(node.id);
        clearRoute();
      }
    } catch (error) {
      console.error('Không thể lấy vị trí GPS:', error);
      setLocationError(t('locationFailed'));
    } finally {
      setLocationLoading(false);
    }
  }

  function selectMapMarker(id: string) {
    Keyboard.dismiss();
    if (routeMode) {
      setRouteEndId(id === routeStartId ? null : id);
      clearRoute();
      setExpanded(true);
      return;
    }
    setSelected(points.find(item => item.id === id) ?? null);
    setExpanded(true);
  }

  const pathNodes = simulation.path.length ? simulation.path : routeResult?.path ?? [];
  const routeCaption = [routeStartId, routeEndId].map(id => routePoints.find(point => point.id === id)?.name).filter(Boolean).join(' → ');
  const routeReady = !!routeStartId && !!routeEndId && routeStartId !== routeEndId;

  return <View style={styles.screen}>
    <MapCanvas
      ref={map}
      pathNodes={pathNodes}
      routeStartId={routeMode ? routeStartId : null}
      routeEndId={routeMode ? routeEndId : null}
      markers={mapMarkers}
      selectedId={routeMode ? null : selected?.id ?? null}
      onSelectMarker={selectMapMarker}
    />

    <View pointerEvents="box-none" style={[styles.top, { top: insets.top + 12 }]}>
      {!routeMode && <View style={styles.search}>
        <View style={{ marginRight: 10 }}><AppIcon name="search" size={23} color={a.muted} /></View>
        <TextInput style={styles.input} value={query} onChangeText={value => { setQuery(value); setSelected(null); setExpanded(true); }}
          returnKeyType="search" autoCorrect={false} onSubmitEditing={() => Keyboard.dismiss()}
          placeholder={t('mapSearch')} placeholderTextColor="#777E78" accessibilityLabel={t('mapSearchLabel')} />
        {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel={t('clearSearch')} onPress={() => setQuery('')} style={styles.clear}><Text>×</Text></Pressable>}
      </View>}
      {!routeMode && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} keyboardShouldPersistTaps="handled">
        {mapZoneFilters.map(({ value, key }) => <Pressable key={value} accessibilityRole="button"
          accessibilityState={{ selected: zone === value }} onPress={() => { setZone(value); setSelected(null); setExpanded(true); }}
          style={[styles.chip, zone === value && styles.chipActive]}>
          <Text style={[styles.chipText, zone === value && styles.chipTextActive]}>{t(key)}</Text>
        </Pressable>)}
      </ScrollView>}
      <Pressable accessibilityRole="button" accessibilityState={{ selected: routeMode }}
        disabled={!routeMode && (loadingPoints || pointsError || points.length < 2)}
        onPress={() => routeMode ? leaveRouteMode() : startRouteMode()}
        style={[styles.routeAction, routeMode && styles.routeActionActive]}>
        <Text style={[styles.routeActionIcon, routeMode && styles.routeActionTextActive]}>{routeMode ? '×' : '↗'}</Text>
        <Text style={[styles.routeActionText, routeMode && styles.routeActionTextActive]}>
          {routeMode ? t('closeRoute') : t('findRoute')}
        </Text>
      </Pressable>
      {routeMode && !expanded && <Pressable accessibilityRole="button" onPress={() => setExpanded(true)} style={styles.routeAction}>
        <Text style={styles.routeActionText}>{t('editRoute')}</Text>
      </Pressable>}
      {!!locationError && <View accessibilityRole="alert" style={[styles.locationStatus, styles.locationError]}>
        <Text style={styles.locationStatusIcon}>!</Text>
        <Text style={styles.locationStatusText}>{locationError}</Text>
      </View>}
      {!simulation.active && location && !locationError && <View accessibilityRole="text" style={[styles.locationStatus, styles.locationSuccess]}>
        <Text style={styles.locationStatusIcon}>◎</Text>
        <Text style={styles.locationStatusText}>
          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          {location.accuracy != null ? `  ·  ±${Math.round(location.accuracy)}m` : ''}
        </Text>
      </View>}
      {__DEV__ && simulation.active && <View style={styles.simulationPanel}>
        <View style={styles.sheetHeader}><Text style={styles.placeTitle}>{t('gpsSimulation')} · {Math.round(simulation.progress * 100)}%</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('gpsSimulationClose')} onPress={simulation.stop} style={styles.clear}><Text>×</Text></Pressable></View>
        <Text style={styles.caption}>{simulation.progress >= 1 ? t('gpsSimulationDone') : t('gpsSimulationHint')}</Text>
        {simulation.gps && <Text selectable style={styles.caption}>Lat {simulation.gps.latitude.toFixed(7)} / Lng {simulation.gps.longitude.toFixed(7)}</Text>}
        <Text style={styles.caption}>{simulatedCoordinates ? `X ${simulatedCoordinates.x.toFixed(2)}% / Y ${simulatedCoordinates.y.toFixed(2)}%` : t('locationOutsideMap')}</Text>
        <View style={styles.simulationActions}>
          <Pressable accessibilityRole="button" onPress={simulation.toggle} style={styles.secondaryAction}><Text style={styles.swapText}>{simulation.running ? t('gpsSimulationPause') : t('gpsSimulationPlay')}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={simulation.reset} style={styles.secondaryAction}><Text style={styles.swapText}>{t('gpsSimulationReset')}</Text></Pressable>
        </View>
        <View style={styles.simulationActions}>
          <Pressable accessibilityRole="button" onPress={() => simulation.inject({ latitude: 10.787366007101104, longitude: 106.70500295127725 })} style={styles.secondaryAction}><Text style={styles.swapText}>{t('gpsSimulationGate')}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => simulation.inject({ latitude: 10.76, longitude: 106.66 })} style={styles.secondaryAction}><Text style={styles.swapText}>{t('gpsSimulationOutside')}</Text></Pressable>
        </View>
      </View>}
    </View>

    <View style={[styles.tools, { top: insets.top + (routeMode ? 72 : 194) }]}>
      <Control label={t('zoomIn')} symbol="+" onPress={() => map.current?.zoomBy(0.5)} />
      <Control label={t('zoomOut')} symbol="−" onPress={() => map.current?.zoomBy(-0.5)} />
      <Control label={t('resetMap')} symbol="⌖" onPress={() => map.current?.reset()} />
      <Control label={t('myLocation')} symbol={locationLoading ? '…' : '◎'} disabled={locationLoading || simulation.active} onPress={() => void locateMe()} />
      {__DEV__ && !simulation.active && <Control label={t('gpsSimulation')} symbol="▶" disabled={locationLoading} onPress={startSimulation} />}
    </View>

    {(!routeMode || expanded) && <View style={[styles.sheet, expanded && { height: Math.min(height * 0.56, Math.max(180, height - insets.top - 190)) }]}>
      <Pressable motion={false} accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={expanded ? t('collapseList') : t('expandList')} onPress={() => setExpanded(value => !value)} style={styles.sheetToggle}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text numberOfLines={2} style={styles.title}>{routeMode ? routeResult ? t('routeFound') : t('findRoute') : selected ? selected.name : `${t('garden')} · ${items.length}`}</Text>
          <Text style={styles.caption}>{expanded ? '⌄' : '⌃'}</Text>
        </View>
        <Text numberOfLines={2} style={styles.caption}>{loadingPoints ? t('mapLoading') : pointsError ? t('mapLoadFailed') : routeMode ? routeResult ? routeCaption : t('routeHelp') : t('mapBrowseHint')}</Text>
      </Pressable>
      {expanded && <Animated.View entering={fadeIn} style={{ flex: 1 }}><ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {loadingPoints ? <View style={styles.loading}><ActivityIndicator color="#285A46" /><Text style={styles.body}>{t('mapLoading')}</Text></View> : pointsError ? <>
          <Text accessibilityRole="alert" style={styles.routeError}>{t('mapLoadFailed')}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadPoints()} style={styles.findRoute}>
            <Text style={styles.findRouteText}>{t('retry')}</Text>
          </Pressable>
        </> : !points.length ? <Text style={styles.body}>{t('mapEmpty')}</Text> : routeMode ? <>
          <RoutePointSelector points={routePoints} label={t('startPoint')} selectedId={routeStartId}
            onSelect={id => selectRoutePoint('start', id)} disabledId={routeEndId} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('swapRoute')} disabled={!routeReady}
            onPress={() => { setRouteStartId(routeEndId!); setRouteEndId(routeStartId); clearRoute(); }}
            style={[styles.swap, !routeReady && styles.disabled]}><Text style={styles.swapText}>⇅  {t('swapRoute')}</Text></Pressable>
          <RoutePointSelector points={routePoints} label={t('endPoint')} selectedId={routeEndId}
            onSelect={id => selectRoutePoint('end', id)} disabledId={routeStartId} />
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !routeReady }} disabled={!routeReady} onPress={findRoute} style={[styles.findRoute, !routeReady && styles.disabled]}>
            <Text style={styles.findRouteText}>{t('findShortestRoute')}</Text>
          </Pressable>
          {!!routeError && <Text accessibilityRole="alert" style={styles.routeError}>{routeError}</Text>}
          {routeResult && <Animated.Text entering={slideIn} accessibilityRole="summary" style={styles.routeSummary}>
            {t('routeFound')} · {routeResult.stepsCount} {t('segments')}
          </Animated.Text>}
          {routeResult && <Pressable accessibilityRole="button" onPress={() => setExpanded(false)} style={styles.secondaryAction}><Text style={styles.swapText}>{t('viewRouteMap')} ↗</Text></Pressable>}
        </> : selected ? <>
          <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={{ paddingVertical: 8 }}><Text style={styles.body}>{t('backToList')}</Text></Pressable>
          <View style={styles.selectedOverview}>
            <AnimalThumbnail id={selected.id} emoji={selected.emoji || markerEmoji(selected.category)} imageUrl={selected.imageUrl ?? null} width={88} height={80} radius={16} />
            <View style={{ flex: 1, gap: 6 }}><Text style={styles.placeTitle}>{selected.name}</Text><Text style={styles.caption}>{selected.zone}</Text></View>
          </View>
          <View style={styles.detail}><Text numberOfLines={4} style={styles.body}>{selected.shortDesc || selected.detailDesc || t('poiDescriptionMissing')}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => setDetailPoi(selected)} style={styles.detailLink}>
            <Text style={styles.detailLinkText}>{t('poiViewDetails')} ↗</Text>
          </Pressable>
          {!detailPoi && <PoiAudioControl key={`${selected.id}:${language}`} poiId={selected.id} />}
          <Pressable accessibilityRole="button" disabled={points.length < 2} onPress={() => startRouteMode(selected.id)} style={styles.findRoute}><Text style={styles.findRouteText}>{t('directionsHere')} ↗</Text></Pressable>
        </> : <>
          {items.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelected(item)} style={styles.place}>
            <AnimalThumbnail id={item.id} emoji={item.emoji || markerEmoji(item.category)} imageUrl={item.imageUrl ?? null} width={44} height={44} radius={14} />
            <View style={{ flex: 1, gap: 4 }}><Text style={styles.placeTitle}>{item.name}</Text><Text style={styles.caption}>{item.zone || t('liveMap')}</Text></View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>)}
          {!items.length && <View style={styles.loading}><Text style={styles.body}>{t('noMatchingPlaces')}</Text>
            <Pressable accessibilityRole="button" onPress={() => { setQuery(''); setZone('all'); Keyboard.dismiss(); }} style={styles.secondaryAction}><Text style={styles.swapText}>{t('clearFilters')}</Text></Pressable></View>}
        </>}
      </ScrollView></Animated.View>}
    </View>}
    {detailPoi && <AnimalDetailPopup key={`${detailPoi.id}:${language}`} poi={{
      id: detailPoi.id, name: detailPoi.name, zone: detailPoi.zone || '',
      emoji: detailPoi.emoji || markerEmoji(detailPoi.category),
      shortDesc: detailPoi.shortDesc || '', detailDesc: detailPoi.detailDesc || '',
      imageUrl: detailPoi.imageUrl ?? null, imageUrls: detailPoi.imageUrls,
    }} onClose={() => setDetailPoi(null)} />}
  </View>;
}

function RoutePointSelector({ points, label, selectedId, onSelect, disabledId }: {
  points: MapNode[];
  label: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabledId: string | null;
}) {
  return <View style={styles.routeSelector}>
    <Text style={styles.routeLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeChoices}>
      {points.map(point => {
        const selected = point.id === selectedId;
        const disabled = point.id === disabledId;
        return <Pressable key={point.id} accessibilityRole="button" accessibilityState={{ selected, disabled }}
          disabled={disabled} onPress={() => onSelect(point.id)}
          style={[styles.routeChoice, selected && styles.routeChoiceActive, disabled && styles.routeChoiceDisabled]}>
          <Text numberOfLines={1} style={[styles.routeChoiceText, selected && styles.routeChoiceTextActive]}>{point.name}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

function Control({ label, symbol, onPress, disabled }: { label: string; symbol: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.control, (pressed || disabled) && { opacity: 0.45 }]}><Text style={styles.controlText}>{symbol}</Text></Pressable>;
}

const styles = StyleSheet.create({
  simulationPanel: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, gap: 6, marginRight: 58, borderWidth: 1, borderColor: '#BFDBFE' },
  simulationActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedOverview: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailLink: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingVertical: 8 },
  detailLinkText: { color: a.forest, fontSize: 14, fontWeight: '600' },
  screen: { flex: 1, backgroundColor: '#E8EDDF', overflow: 'hidden' },
  top: { position: 'absolute', left: 16, right: 16, gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', minHeight: 52, backgroundColor: '#FFF', borderRadius: 28, paddingHorizontal: 16, elevation: 3, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  searchIcon: { fontSize: 28, color: '#285A46', marginRight: 10 },
  input: { flex: 1, minWidth: 0, color: '#202823', fontSize: 16, paddingVertical: 12 },
  clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingBottom: 4 },
  chip: { backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, elevation: 2 },
  chipActive: { backgroundColor: '#285A46' },
  chipText: { color: '#343D36', fontSize: 13 },
  chipTextActive: { color: '#FFF' },
  routeAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, elevation: 2 },
  routeActionActive: { backgroundColor: '#285A46' },
  routeActionIcon: { color: '#285A46', fontSize: 18, fontWeight: '700' },
  routeActionText: { color: '#285A46', fontSize: 13, fontWeight: '600' },
  routeActionTextActive: { color: '#FFF' },
  tools: { position: 'absolute', right: 16, gap: 10 },
  locationStatus: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '88%', minHeight: 42, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, elevation: 3, shadowColor: '#15251A', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  locationError: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  locationSuccess: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  locationStatusIcon: { color: '#1E3A8A', fontSize: 17, fontWeight: '700' },
  locationStatusText: { flexShrink: 1, color: '#1E3A8A', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  control: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  controlText: { color: '#285A46', fontSize: 26 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: a.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, elevation: 6, shadowColor: '#15251A', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -3 } },
  handleArea: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CCC7B7' },
  sheetToggle: { paddingHorizontal: 20, paddingBottom: 10, gap: 3 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 23, lineHeight: 29, color: a.ink, fontWeight: '700', fontFamily: a.serif },
  caption: { fontSize: 13, lineHeight: 19, color: '#626D63' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: a.border },
  placeIcon: { width: 44, height: 44, backgroundColor: a.pale, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  placeTitle: { fontSize: 14, lineHeight: 21, color: a.ink, fontWeight: '600' },
  arrow: { fontSize: 24, color: '#788078' },
  detail: { gap: 12, paddingTop: 8 },
  body: { fontSize: 15, lineHeight: 23, color: '#626D63' },
  routeSelector: { gap: 8 },
  routeLabel: { color: '#626D63', fontSize: 12, fontWeight: '600' },
  routeChoices: { gap: 8 },
  routeChoice: { maxWidth: 260, minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', backgroundColor: '#F2F5F0', borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 },
  routeChoiceActive: { backgroundColor: '#DDF5E8', borderWidth: 1, borderColor: '#285A46' },
  routeChoiceDisabled: { opacity: 0.35 },
  routeChoiceText: { color: '#343D36', fontSize: 14 },
  routeChoiceTextActive: { color: '#285A46', fontWeight: '600' },
  findRoute: { alignItems: 'center', justifyContent: 'center', minHeight: 44, backgroundColor: '#285A46', borderRadius: 22, marginTop: 2 },
  findRouteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  routeError: { color: '#B42318', fontSize: 12 },
  routeSummary: { color: '#285A46', fontSize: 12, fontWeight: '600' },
  loading: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  swap: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  swapText: { color: '#285A46', fontSize: 14, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#EDF5EF', paddingHorizontal: 16 },
});
