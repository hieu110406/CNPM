import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Pressable from '@/components/ui/AnimatedPressable';
import Animated from 'react-native-reanimated';
import { fadeIn } from '@/components/ui/motion';
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
import { createPositionWatcher } from '@/utils/positionWatcher';
import { gpsToMapCoordinates, mapToGpsCoordinates } from '@/utils/gpsMapCalibration';

const CURRENT_LOCATION_ID = 'current_location';

// Tọa độ dùng riêng cho DEMO — tuyệt đối không thay thế vị trí GPS thật.
const DEMO_GATE_GPS = { latitude: 10.787366007101104, longitude: 106.70500295127725 };
const DEMO_OUTSIDE_GPS = { latitude: 10.76, longitude: 106.66 };

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
    timestamp: number;
};

const mapZoneFilters: { value: string; key: TranslationKey }[] = [
    { value: 'all', key: 'all' },
    { value: 'animal', key: 'mapAnimals' },
    { value: 'building', key: 'mapBuildings' },
    { value: 'service', key: 'mapServices' },
];

function markerEmoji(category: string) {
    return ({
        animal: '🐾', building: '🏛️', service: '🚋', restaurant: '🍴', restroom: '🚻',
        medical: '🏥', plant: '🌿', photo: '📷', entertainment: '🎡'
    } as Record<string, string>)[category] || '📍';
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
    const [manualRouteStartId, setRouteStartId] = useState<string>('');
    const [routeEndId, setRouteEndId] = useState<string | null>(null);
    const [selectingTarget, setSelectingTarget] = useState<'start' | 'end' | null>(null);
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
    const [locationTracking, setLocationTracking] = useState(false);
    const gpsContext = useRef({ gpsAnchors, points, t });
    useEffect(() => { gpsContext.current = { gpsAnchors, points, t }; }, [gpsAnchors, points, t]);
    const locationRequest = useRef(0);
    const [locationWatcher] = useState(() => createPositionWatcher<Location.LocationObject>(
        (onPosition, onError) => Location.watchPositionAsync({
            accuracy: Location.Accuracy.High, distanceInterval: 2, timeInterval: 2000,
        }, onPosition, onError),
    ));
    const stopLocationTracking = useCallback(() => {
        locationRequest.current++;
        locationWatcher.stop();
        setLocationTracking(false);
        setLocationLoading(false);
    }, [locationWatcher]);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [pointsError, setPointsError] = useState(false);
    const pointsVersion = useRef(0);
    const items = useMemo(() => points.filter(item => (zone === 'all' || item.category === zone) &&
        normalizeSearch(item.name).includes(normalizeSearch(query))), [points, zone, query]);
    const activeLocationNode = simulation.active ? simulatedNode : location?.node;
    const routePoints = activeLocationNode ? [...points, activeLocationNode] : points;
    const gpsAvailable = !!activeLocationNode && (simulation.active || locationTracking);
    const gpsRouting = routeMode && gpsAvailable;
    const routeStartId = gpsRouting ? CURRENT_LOCATION_ID :
        (manualRouteStartId !== routeEndId ? manualRouteStartId : '');
    const gpsX = activeLocationNode?.x;
    const gpsY = activeLocationNode?.y;
    const gpsRouteResult = (() => {
        if (!gpsRouting || !routeEndId || gpsX == null || gpsY == null) return null;
        buildGraph([...points, { id: CURRENT_LOCATION_ID, name: CURRENT_LOCATION_ID, category: 'current_location', x: gpsX, y: gpsY }]);
        return shortestPath(CURRENT_LOCATION_ID, routeEndId);
    })();
    const currentRouteResult = gpsRouting ? gpsRouteResult : routeResult?.path[0]?.id === routeStartId &&
        routeResult.path[routeResult.path.length - 1]?.id === routeEndId ? routeResult : null;
    const startPointName = gpsRouting
        ? (simulation.active ? t('gpsSimulation') : t('myLocation'))
        : points.find(p => p.id === manualRouteStartId)?.name || '';
    const endPointName = points.find(p => p.id === routeEndId)?.name || '';
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

    const startLocationTracking = useCallback(async (isUserAction = false): Promise<boolean> => {
        if (locationTracking) return true;
        const request = ++locationRequest.current;
        setLocationLoading(true);
        setLocationError('');
        const isCurrent = () => request === locationRequest.current;
        try {
            let permission = await Location.getForegroundPermissionsAsync();
            if (!permission.granted && isUserAction) {
                permission = await Location.requestForegroundPermissionsAsync();
            }
            if (!isCurrent()) return false;
            if (!permission.granted) {
                if (isUserAction) setLocationError(t('locationPermissionDenied'));
                return false;
            }
            if (!await Location.hasServicesEnabledAsync()) {
                if (isUserAction) setLocationError(t('locationFailed'));
                return false;
            }
            if (!isCurrent()) return false;
            setLocationTracking(true);
            await locationWatcher.start(current => {
                if (!isCurrent()) return;
                setLocationLoading(false);
                const { gpsAnchors: anchors, points: currentPoints, t: translate } = gpsContext.current;
                const coordinates = gpsToMapCoordinates(current.coords.latitude, current.coords.longitude, anchors);
                if (!coordinates) {
                    locationRef.current = null;
                    setLocation(null);
                    setRouteResult(result => result?.path[0]?.id === CURRENT_LOCATION_ID ? null : result);
                    setLocationError(anchors.length < 4 ? translate('locationCalibrationMissing') : translate('locationOutsideMap'));
                    return;
                }
                setLocationError('');
                const node: MapNode = {
                    id: CURRENT_LOCATION_ID, name: t('myLocation'),
                    x: coordinates.x, y: coordinates.y, category: 'current_location'
                };
                const nextLocation = {
                    node, latitude: current.coords.latitude,
                    longitude: current.coords.longitude, accuracy: current.coords.accuracy, timestamp: current.timestamp
                };
                locationRef.current = nextLocation;
                setLocation(nextLocation);
                buildGraph([...currentPoints, node]);
                setRouteResult(result => {
                    if (!result || result.path[0]?.id !== CURRENT_LOCATION_ID) return result;
                    return shortestPath(CURRENT_LOCATION_ID, result.path[result.path.length - 1].id);
                });
            }, () => {
                if (!isCurrent()) return;
                stopLocationTracking();
                setLocationError(t('locationFailed'));
            });
            return true;
        } catch {
            if (isCurrent()) { stopLocationTracking(); if (isUserAction) setLocationError(t('locationFailed')); }
            return false;
        } finally {
            if (isCurrent()) setLocationLoading(false);
        }
    }, [locationTracking, locationWatcher, t, stopLocationTracking]);

    // Request permission on each map visit, without restarting the watcher on GPS updates.
    const startLocationRef = useRef(startLocationTracking);
    useEffect(() => { startLocationRef.current = startLocationTracking; }, [startLocationTracking]);
    useFocusEffect(useCallback(() => {
        void startLocationRef.current(true);
        return stopLocationTracking;
    }, [stopLocationTracking]));

    const toggleLocationTracking = useCallback(async () => {
        if (locationTracking) {
            stopLocationTracking();
            return;
        }
        await startLocationTracking(true);
    }, [locationTracking, stopLocationTracking, startLocationTracking]);

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
            setRouteStartId('');
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
        return () => { pointsVersion.current++; setDetailPoi(null); stopLocationTracking(); };
    }, [loadPoints, stopLocationTracking]));

    async function startRouteMode(destinationId?: string) {
        Keyboard.dismiss();
        setRouteMode(true);
        setSelectingTarget(null);
        clearRoute();
        map.current?.reset();

        let hasGps = gpsAvailable;
        if (!hasGps && !simulation.active && !locationTracking) {
            hasGps = await startLocationTracking(false);
        }

        if (hasGps || gpsAvailable) {
            setRouteEndId(destinationId || null);
            if (destinationId) {
                const activeNode = simulation.active ? simulatedNode : locationRef.current?.node;
                if (activeNode) {
                    buildGraph([...points, activeNode]);
                    const result = shortestPath(CURRENT_LOCATION_ID, destinationId);
                    setRouteResult(result);
                    setRouteError(result ? '' : t('routeNotFound'));
                }
            }
        } else {
            if (destinationId) {
                setRouteEndId(destinationId);
                setRouteStartId('');
                setSelectingTarget('start');
            } else {
                setRouteStartId('');
                setRouteEndId(null);
                setSelectingTarget('start');
            }
        }
    }

    function leaveRouteMode() {
        setRouteMode(false);
        setSelectingTarget(null);
        clearRoute();
    }

    function stopNavigation() {
        leaveRouteMode();
        simulation.stop();
        setSelected(null);
        setExpanded(false);
    }

    function swapPoints() {
        if (!manualRouteStartId || !routeEndId) return;
        const newStart = routeEndId;
        const newEnd = manualRouteStartId;
        setRouteStartId(newStart);
        setRouteEndId(newEnd);
        clearRoute();
        buildGraph(routePoints);
        const result = shortestPath(newStart, newEnd);
        setRouteResult(result);
        setRouteError(result ? '' : t('routeNotFound'));
    }

    function resetPoints() {
        setRouteStartId('');
        setRouteEndId(null);
        clearRoute();
        setSelectingTarget('start');
    }

    // Demo chỉ dùng tọa độ giả lập. Tất cả đường đi vẫn sử dụng thuật toán hiện tại.
    function startSimulation(initialGps = DEMO_GATE_GPS) {
        const demo = currentRouteResult?.path.length
            ? currentRouteResult.path
            : shortestPath('w47', 'w16')?.path;
        if (!demo || demo.length < 2 || gpsAnchors.length < 4 ||
            !mapToGpsCoordinates(demo[0].x, demo[0].y, gpsAnchors)) {
            setLocationError('Không thể khởi động Demo GPS: chưa đủ dữ liệu bản đồ hoặc điểm hiệu chỉnh.');
            return;
        }
        stopLocationTracking();
        locationRef.current = null;
        setLocation(null);
        simulation.start(demo);
        simulation.inject(initialGps);
        setLocationError('');
        setExpanded(false);
        map.current?.reset();
    }

    function stopSimulationAndUseRealGps() {
        simulation.stop();
        setLocationError('');
        void startLocationTracking(true);
    }

    function selectMapMarker(id: string) {
        Keyboard.dismiss();
        if (routeMode) {
            if (!points.some(point => point.id === id)) return;

            if (gpsRouting) {
                setRouteEndId(id);
                clearRoute();
                buildGraph(routePoints);
                const result = shortestPath(CURRENT_LOCATION_ID, id);
                setRouteResult(result);
                setRouteError(result ? '' : t('routeNotFound'));
                return;
            }

            // Manual 2 POI selection by tapping on the map
            if (selectingTarget === 'start') {
                if (id === routeEndId) {
                    setRouteEndId(null);
                }
                setRouteStartId(id);
                setSelectingTarget(null);
                if (routeEndId && id !== routeEndId) {
                    buildGraph(routePoints);
                    const result = shortestPath(id, routeEndId);
                    setRouteResult(result);
                    setRouteError(result ? '' : t('routeNotFound'));
                } else {
                    clearRoute();
                }
                return;
            }

            if (selectingTarget === 'end') {
                if (id === manualRouteStartId) {
                    setRouteStartId('');
                }
                setRouteEndId(id);
                setSelectingTarget(null);
                if (manualRouteStartId && id !== manualRouteStartId) {
                    buildGraph(routePoints);
                    const result = shortestPath(manualRouteStartId, id);
                    setRouteResult(result);
                    setRouteError(result ? '' : t('routeNotFound'));
                } else {
                    clearRoute();
                }
                return;
            }

            // Default sequential picking:
            if (!manualRouteStartId) {
                setRouteStartId(id);
                if (id === routeEndId) setRouteEndId(null);
                clearRoute();
            } else if (!routeEndId) {
                if (id === manualRouteStartId) return;
                setRouteEndId(id);
                buildGraph(routePoints);
                const result = shortestPath(manualRouteStartId, id);
                setRouteResult(result);
                setRouteError(result ? '' : t('routeNotFound'));
            } else {
                if (id === manualRouteStartId) return;
                setRouteEndId(id);
                buildGraph(routePoints);
                const result = shortestPath(manualRouteStartId, id);
                setRouteResult(result);
                setRouteError(result ? '' : t('routeNotFound'));
            }
            return;
        }

        setSelected(points.find(item => item.id === id) ?? null);
        setExpanded(true);
    }

    const pathNodes = currentRouteResult?.path ?? simulation.path;
    const routeCaption = [routeStartId, routeEndId].map(id => routePoints.find(point => point.id === id)?.name).filter(Boolean).join(' → ');
    const navigating = routeMode && !!currentRouteResult;

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
            {!navigating && <Pressable accessibilityRole="button" accessibilityState={{ selected: routeMode }}
                disabled={!routeMode && (loadingPoints || pointsError || points.length < 2)}
                onPress={() => routeMode ? leaveRouteMode() : void startRouteMode()}
                style={[styles.routeAction, routeMode && styles.routeActionActive]}>
                <Text style={[styles.routeActionIcon, routeMode && styles.routeActionTextActive]}>{routeMode ? '×' : '↗'}</Text>
                <Text style={[styles.routeActionText, routeMode && styles.routeActionTextActive]}>
                    {routeMode ? t('closeRoute') : t('findRoute')}
                </Text>
            </Pressable>}
            {!!locationError && <View accessibilityRole="alert" style={[styles.locationStatus, styles.locationError]}>
                <Text style={styles.locationStatusIcon}>!</Text>
                <Text style={styles.locationStatusText}>{locationError}</Text>
            </View>}
            {simulation.active && <View style={styles.simulationPanel}>
                <View style={styles.sheetHeader}>
                    <Text style={styles.demoTitle}>🧪 DEMO GPS — VỊ TRÍ MÔ PHỎNG</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Tắt mô phỏng GPS" onPress={stopSimulationAndUseRealGps} style={styles.clear}><Text>×</Text></Pressable>
                </View>
                <Text style={styles.demoNotice}>Không phải vị trí GPS thật của điện thoại.</Text>
                {simulation.gps && <Text selectable style={styles.caption}>Lat {simulation.gps.latitude.toFixed(7)} / Lng {simulation.gps.longitude.toFixed(7)}</Text>}
                <Text style={styles.caption}>{simulatedCoordinates
                    ? `Trên bản đồ: X ${simulatedCoordinates.x.toFixed(2)}% · Y ${simulatedCoordinates.y.toFixed(2)}%`
                    : 'Tọa độ nằm ngoài phạm vi Thảo Cầm Viên — không hiển thị chấm vị trí.'}</Text>
                <View style={styles.simulationActions}>
                    <Pressable accessibilityRole="button" onPress={() => simulation.inject(DEMO_GATE_GPS)} style={styles.demoAction}><Text style={styles.swapText}>📍 Cổng</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => simulation.inject({ latitude: GPS_ZEBRA_ANCHOR.latitude, longitude: GPS_ZEBRA_ANCHOR.longitude })} style={styles.demoAction}><Text style={styles.swapText}>🦓 Ngựa vằn</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => simulation.inject(DEMO_OUTSIDE_GPS)} style={styles.demoAction}><Text style={styles.swapText}>↗ Ngoài khu</Text></Pressable>
                </View>
                <View style={styles.simulationActions}>
                    <Pressable accessibilityRole="button" onPress={() => {
                        const demo = currentRouteResult?.path.length ? currentRouteResult.path : shortestPath('w47', 'w16')?.path;
                        if (demo && demo.length >= 2) simulation.start(demo);
                    }} style={styles.demoAction}><Text style={styles.swapText}>▶ Chạy tuyến demo</Text></Pressable>
                    {simulation.running && <Pressable accessibilityRole="button" onPress={simulation.toggle} style={styles.demoAction}><Text style={styles.swapText}>Ⅱ Tạm dừng</Text></Pressable>}
                    <Pressable accessibilityRole="button" onPress={stopSimulationAndUseRealGps} style={styles.demoRealAction}><Text style={styles.demoRealText}>◎ GPS thật</Text></Pressable>
                </View>
            </View>}
        </View>

        <View style={[styles.tools, { top: insets.top + (routeMode ? 72 : 194) }]}>
            <Control label={t('zoomIn')} symbol="+" onPress={() => map.current?.zoomBy(0.5)} />
            <Control label={t('zoomOut')} symbol="−" onPress={() => map.current?.zoomBy(-0.5)} />
            <Control label={t('resetMap')} symbol="⌖" onPress={() => map.current?.reset()} />
            {!navigating && <Control label={locationTracking ? t('locationStopTracking') : t('myLocation')} symbol={locationLoading ? '…' : locationTracking ? '■' : '◎'} disabled={locationLoading || simulation.active} onPress={() => void toggleLocationTracking()} />}
            {!navigating && !simulation.active && <Pressable accessibilityRole="button" accessibilityLabel="Bật chế độ Demo GPS mô phỏng" disabled={loadingPoints || pointsError || locationLoading}
                onPress={() => startSimulation()} style={[styles.demoTrigger, (loadingPoints || pointsError || locationLoading) && { opacity: 0.45 }]}>
                <Text style={styles.demoTriggerText}>DEMO GPS</Text>
            </Pressable>}
        </View>

        {navigating ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('stopNavigation')}
                onPress={stopNavigation} style={[styles.stopNavigation, { bottom: Math.max(insets.bottom, 16) }]}>
                <Text style={styles.findRouteText}>■ {t('stopNavigation')}</Text>
            </Pressable>
        ) : routeMode ? (
            <View style={[styles.routeSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.routeSheetHeader}>
                    <View style={styles.routeSheetTitleRow}>
                        <View style={styles.routeSheetIconBadge}>
                            <Text style={styles.routeSheetIconEmoji}>{gpsRouting ? '📍' : '🧭'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.routeSheetTitle}>{currentRouteResult ? t('routeFound') : t('findRoute')}</Text>
                            <Text numberOfLines={1} style={styles.routeSheetSubtitle}>
                                {gpsRouting
                                    ? (routeEndId ? routeCaption : t('routeStepGps'))
                                    : (!manualRouteStartId && !routeEndId)
                                        ? t('routeStepStart')
                                        : (manualRouteStartId && !routeEndId)
                                            ? t('routeStepEnd')
                                            : (!manualRouteStartId && routeEndId)
                                                ? t('routeStepStart')
                                                : routeCaption}
                            </Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('closeRoute')}
                            onPress={leaveRouteMode}
                            style={styles.routeCloseBtn}
                        >
                            <Text style={styles.routeCloseBtnText}>✕</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Selected Points Cards */}
                <View style={styles.routePointsBox}>
                    {/* Start Point */}
                    <Pressable
                        accessibilityRole="button"
                        disabled={gpsRouting}
                        onPress={() => setSelectingTarget('start')}
                        style={[
                            styles.routePointRow,
                            !gpsRouting && selectingTarget === 'start' && styles.routePointRowActive,
                        ]}
                    >
                        <View style={[styles.routeDot, { backgroundColor: '#047857' }]} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.routePointLabel}>{t('startPoint')}</Text>
                            <Text numberOfLines={1} style={[styles.routePointVal, !startPointName && styles.routePointValEmpty]}>
                                {startPointName || t('routeTapOnMap')}
                            </Text>
                        </View>
                        {!gpsRouting && !!manualRouteStartId && (
                            <Text style={styles.routePointChangeText}>{selectingTarget === 'start' ? '●' : t('routeChange')}</Text>
                        )}
                    </Pressable>

                    {/* End Point */}
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setSelectingTarget('end')}
                        style={[
                            styles.routePointRow,
                            selectingTarget === 'end' && styles.routePointRowActive,
                        ]}
                    >
                        <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.routePointLabel}>{t('endPoint')}</Text>
                            <Text numberOfLines={1} style={[styles.routePointVal, !endPointName && styles.routePointValEmpty]}>
                                {endPointName || t('routeTapOnMap')}
                            </Text>
                        </View>
                        {!!routeEndId && (
                            <Text style={styles.routePointChangeText}>{selectingTarget === 'end' ? '●' : t('routeChange')}</Text>
                        )}
                    </Pressable>
                </View>

                {/* Footer Actions / Results */}
                {!!routeError && (
                    <Text accessibilityRole="alert" style={styles.routeError}>{routeError}</Text>
                )}

                {currentRouteResult ? (
                    <View style={styles.routeResultBar}>
                        <View style={styles.routeResultInfo}>
                            <Text style={styles.routeResultSteps}>
                                {currentRouteResult.stepsCount} {t('segments')}
                            </Text>
                            {typeof currentRouteResult.totalDistance === 'number' && (
                                <Text style={styles.routeResultDist}>
                                    ~{Math.round(currentRouteResult.totalDistance * 10)}m
                                </Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {!gpsRouting && (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={t('swapRoute')}
                                    onPress={swapPoints}
                                    style={styles.routeSmallBtn}
                                >
                                    <Text style={styles.routeSmallBtnText}>⇄ {t('swapRoute')}</Text>
                                </Pressable>
                            )}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('routeReset')}
                                onPress={resetPoints}
                                style={styles.routeSmallBtn}
                            >
                                <Text style={styles.routeSmallBtnText}>{t('routeReset')}</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={styles.routeActionBar}>
                        <Text style={styles.routeHintText}>
                            {!gpsRouting
                                ? !manualRouteStartId
                                    ? '👉 ' + t('routeStepStart')
                                    : !routeEndId
                                        ? '👉 ' + t('routeStepEnd')
                                        : ''
                                : !routeEndId
                                    ? '👉 ' + t('routeStepGps')
                                    : ''}
                        </Text>
                        {!gpsRouting && (manualRouteStartId || routeEndId) ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('routeReset')}
                                onPress={resetPoints}
                                style={styles.routeSmallBtn}
                            >
                                <Text style={styles.routeSmallBtnText}>{t('routeReset')}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                )}
            </View>
        ) : (
            <View style={[styles.sheet, expanded && { height: Math.min(height * 0.56, Math.max(180, height - insets.top - 190)) }]}>
                <Pressable motion={false} accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={expanded ? t('collapseList') : t('expandList')} onPress={() => setExpanded(value => !value)} style={styles.sheetToggle}>
                    <View style={styles.handleArea}>
                        <View style={styles.handle} />
                    </View>
                    <View style={styles.sheetHeader}>
                        <Text numberOfLines={2} style={styles.title}>{selected ? selected.name : `${t('garden')} · ${items.length}`}</Text>
                        <Text style={styles.caption}>{expanded ? '⌄' : '⌃'}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.caption}>{loadingPoints ? t('mapLoading') : pointsError ? t('mapLoadFailed') : t('mapBrowseHint')}</Text>
                </Pressable>
                {expanded && <Animated.View entering={fadeIn} style={{ flex: 1 }}><ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                    {loadingPoints ? <View style={styles.loading}><ActivityIndicator color="#285A46" /><Text style={styles.body}>{t('mapLoading')}</Text></View> : pointsError ? <>
                        <Text accessibilityRole="alert" style={styles.routeError}>{t('mapLoadFailed')}</Text>
                        <Pressable accessibilityRole="button" onPress={() => void loadPoints()} style={styles.findRoute}>
                            <Text style={styles.findRouteText}>{t('retry')}</Text>
                        </Pressable>
                    </> : !points.length ? <Text style={styles.body}>{t('mapEmpty')}</Text> : selected ? <>
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
                        <Pressable accessibilityRole="button" disabled={points.length < 2} onPress={() => void startRouteMode(selected.id)} style={styles.findRoute}><Text style={styles.findRouteText}>{t('directionsHere')} ↗</Text></Pressable>
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
            </View>
        )}
        {detailPoi && <AnimalDetailPopup key={`${detailPoi.id}:${language}`} poi={{
            id: detailPoi.id, name: detailPoi.name, zone: detailPoi.zone || '',
            emoji: detailPoi.emoji || markerEmoji(detailPoi.category),
            shortDesc: detailPoi.shortDesc || '', detailDesc: detailPoi.detailDesc || '',
            imageUrl: detailPoi.imageUrl ?? null, imageUrls: detailPoi.imageUrls,
        }} onClose={() => setDetailPoi(null)} />}
    </View>;
}

function Control({ label, symbol, onPress, disabled }: { label: string; symbol: string; onPress: () => void; disabled?: boolean }) {
    return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
        onPress={onPress} style={({ pressed }) => [styles.control, (pressed || disabled) && { opacity: 0.45 }]}><Text style={styles.controlText}>{symbol}</Text></Pressable>;
}

const styles = StyleSheet.create({
    stopNavigation: { position: 'absolute', alignSelf: 'center', minHeight: 48, paddingHorizontal: 28, borderRadius: 24, backgroundColor: '#285A46', alignItems: 'center', justifyContent: 'center', elevation: 4 },
    simulationPanel: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, gap: 8, marginRight: 44, borderWidth: 1, borderColor: '#BFDBFE', elevation: 4 },
    simulationActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    demoTitle: { flex: 1, color: '#1E40AF', fontSize: 13, fontWeight: '800' },
    demoNotice: { color: '#B45309', fontSize: 12, fontWeight: '600' },
    demoAction: { minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#EFF6FF', paddingHorizontal: 12 },
    demoRealAction: { minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#205E48', paddingHorizontal: 12 },
    demoRealText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    demoTrigger: { minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E40AF', borderRadius: 15, paddingHorizontal: 8, elevation: 3 },
    demoTriggerText: { color: '#FFF', fontWeight: '800', fontSize: 10, letterSpacing: 0.1 },
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
    findRoute: { alignItems: 'center', justifyContent: 'center', minHeight: 44, backgroundColor: '#285A46', borderRadius: 22, marginTop: 2 },
    findRouteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    routeError: { color: '#B42318', fontSize: 12 },
    loading: { alignItems: 'center', paddingVertical: 24, gap: 12 },
    secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#EDF5EF', paddingHorizontal: 16 },
    swapText: { color: '#285A46', fontSize: 14, fontWeight: '600' },

    /* Dedicated Route Mode Sheet */
    routeSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: a.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 14,
        gap: 10,
        elevation: 8,
        shadowColor: '#15251A',
        shadowOpacity: 0.15,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: -3 },
    },
    routeSheetHeader: {
        gap: 2,
    },
    routeSheetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    routeSheetIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#EDF5EF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeSheetIconEmoji: {
        fontSize: 18,
    },
    routeSheetTitle: {
        fontSize: 17,
        lineHeight: 21,
        color: a.ink,
        fontWeight: '700',
        fontFamily: a.serif,
    },
    routeSheetSubtitle: {
        fontSize: 12,
        color: '#626D63',
        marginTop: 1,
    },
    routeCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F5F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeCloseBtnText: {
        fontSize: 15,
        color: '#343D36',
        fontWeight: '600',
    },
    routePointsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    routePointRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    routePointRowActive: {
        borderColor: '#285A46',
        backgroundColor: '#F0FDF4',
    },
    routeDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
    routePointLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
    },
    routePointVal: {
        fontSize: 12,
        color: '#1E293B',
        fontWeight: '600',
        marginTop: 1,
    },
    routePointValEmpty: {
        color: '#94A3B8',
        fontStyle: 'italic',
        fontWeight: '400',
    },
    routePointChangeText: {
        fontSize: 11,
        color: '#285A46',
        fontWeight: '600',
    },
    routeResultBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EDF5EF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    routeResultInfo: {
        flex: 1,
    },
    routeResultSteps: {
        fontSize: 13,
        fontWeight: '700',
        color: '#285A46',
    },
    routeResultDist: {
        fontSize: 11,
        color: '#626D63',
        marginTop: 1,
    },
    routeActionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 32,
    },
    routeHintText: {
        fontSize: 12,
        color: '#285A46',
        fontWeight: '600',
        flex: 1,
    },
    routeSmallBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#285A46',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeSmallBtnText: {
        fontSize: 12,
        color: '#285A46',
        fontWeight: '600',
    },
});
