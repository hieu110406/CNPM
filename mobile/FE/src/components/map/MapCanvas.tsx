import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Image, PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import type { MapGraphNode } from '../../../../../app/FE/src/components/map/mapGraph';

export type MapCanvasHandle = { zoomBy: (delta: number) => void; reset: () => void };

export type MapMarker = {
  id: string;
  title: string;
  emoji: string;
  x: number;
  y: number;
  color: string;
};

type MapCanvasProps = {
  pathNodes: MapGraphNode[];
  routeStartId: string | null;
  routeEndId: string | null;
  markers: MapMarker[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
};

const FIT_ZOOM = 0.6;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.5;

function getMapSize(width: number, height: number) {
  const mapHeight = Math.min(height, width * 875 / 1371);
  return { width: mapHeight * 1371 / 875, height: mapHeight };
}

function getPanLimits(width: number, height: number, zoom: number) {
  const size = getMapSize(width, height);
  return {
    x: Math.max(0, (size.width * zoom - width) / 2),
    y: Math.max(0, (size.height * zoom - height) / 2),
  };
}

export default forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  { pathNodes, routeStartId, routeEndId, markers, selectedId, onSelectMarker },
  ref,
) {
  const view = useRef<View>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [scale] = useState(() => new Animated.Value(FIT_ZOOM));
  const [zoomLevel, setZoomLevel] = useState(FIT_ZOOM);
  const [position] = useState(() => new Animated.ValueXY());
  const frame = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0, zoom: FIT_ZOOM });
  const [handlers, setHandlers] = useState<ReturnType<typeof PanResponder.create> | null>(null);
  const mapSize = getMapSize(layout.width, layout.height);
  const markerScale = Math.min(1, FIT_ZOOM / zoomLevel);

  useEffect(() => {
    function apply(x: number, y: number, zoom: number) {
      const limits = getPanLimits(frame.current.width, frame.current.height, zoom);
      current.current = {
        x: Math.max(-limits.x, Math.min(limits.x, x)),
        y: Math.max(-limits.y, Math.min(limits.y, y)),
        zoom,
      };
      position.setValue({ x: current.current.x, y: current.current.y });
      scale.setValue(zoom);
      setZoomLevel(zoom);
    }

    let start = { x: 0, y: 0, zoom: 1, distance: 0, focalX: 0, focalY: 0, count: 0 };
    function point(event: GestureResponderEvent) {
      const [a, b] = event.nativeEvent.touches;
      const f = frame.current;
      return {
        x: (b ? (a.pageX + b.pageX) / 2 : a.pageX) - f.x - f.width / 2,
        y: (b ? (a.pageY + b.pageY) / 2 : a.pageY) - f.y - f.height / 2,
        distance: b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0,
      };
    }
    function begin(event: GestureResponderEvent) {
      if (!event.nativeEvent.touches.length) return;
      const p = point(event);
      start = {
        ...current.current,
        distance: p.distance,
        focalX: p.x,
        focalY: p.y,
        count: event.nativeEvent.touches.length,
      };
    }

    setHandlers(PanResponder.create({
      onStartShouldSetPanResponder: event => event.nativeEvent.touches.length > 1,
      onMoveShouldSetPanResponder: event => event.nativeEvent.touches.length > 0,
      onPanResponderGrant: begin,
      onPanResponderStart: begin,
      onPanResponderMove: event => {
        if (!event.nativeEvent.touches.length) return;
        if (event.nativeEvent.touches.length !== start.count) {
          begin(event);
          return;
        }
        const p = point(event);
        const zoom = start.distance > 0
          ? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, start.zoom * p.distance / start.distance))
          : start.zoom;
        const ratio = zoom / start.zoom;
        apply(p.x - (start.focalX - start.x) * ratio, p.y - (start.focalY - start.y) * ratio, zoom);
      },
      onPanResponderTerminationRequest: () => false,
    }));
  }, [position, scale]);

  useImperativeHandle(ref, () => ({
    zoomBy(delta) {
      const previous = current.current;
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, previous.zoom + delta));
      const limits = getPanLimits(frame.current.width, frame.current.height, zoom);
      const ratio = zoom / previous.zoom;
      const x = Math.max(-limits.x, Math.min(limits.x, previous.x * ratio));
      const y = Math.max(-limits.y, Math.min(limits.y, previous.y * ratio));
      current.current = { x, y, zoom };
      position.setValue({ x, y });
      scale.setValue(zoom);
      setZoomLevel(zoom);
    },
    reset() {
      current.current = { x: 0, y: 0, zoom: FIT_ZOOM };
      position.setValue({ x: 0, y: 0 });
      scale.setValue(FIT_ZOOM);
      setZoomLevel(FIT_ZOOM);
    },
  }), [position, scale]);

  return (
    <View
      ref={view}
      collapsable={false}
      style={styles.canvas}
      {...handlers?.panHandlers}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        frame.current = { ...frame.current, width, height };
        setLayout({ width, height });
        view.current?.measureInWindow((x, y) => {
          frame.current = { ...frame.current, x, y };
        });
        current.current = { x: 0, y: 0, zoom: FIT_ZOOM };
        position.setValue({ x: 0, y: 0 });
        scale.setValue(FIT_ZOOM);
        setZoomLevel(FIT_ZOOM);
      }}
    >
      <Animated.View
        style={[
          styles.mapLayer,
          {
            width: mapSize.width,
            height: mapSize.height,
            left: (layout.width - mapSize.width) / 2,
            top: (layout.height - mapSize.height) / 2,
            transform: [{ translateX: position.x }, { translateY: position.y }, { scale }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/zoo-map.png')}
          resizeMode="contain"
          accessibilityLabel="Bản đồ Thảo Cầm Viên"
          style={[styles.mapImage, { width: mapSize.width, height: mapSize.height }]}
        />
        {pathNodes.slice(1).map((node, index) => {
          const previous = pathNodes[index];
          const x1 = previous.x / 100 * mapSize.width;
          const y1 = previous.y / 100 * mapSize.height;
          const x2 = node.x / 100 * mapSize.width;
          const y2 = node.y / 100 * mapSize.height;
          const length = Math.hypot(x2 - x1, y2 - y1);
          const angle = Math.atan2(y2 - y1, x2 - x1);
          return (
            <View
              key={`${previous.id}-${node.id}`}
              pointerEvents="none"
              style={[
                styles.routeSegment,
                {
                  left: (x1 + x2 - length) / 2,
                  top: (y1 + y2) / 2 - 5,
                  width: length,
                  transform: [{ rotate: `${angle * 180 / Math.PI}deg` }],
                },
              ]}
            >
              <View style={styles.routeSegmentInner} />
            </View>
          );
        })}
        {pathNodes.map((node, index) => {
          const isStart = node.id === routeStartId;
          const isEnd = node.id === routeEndId;
          return (
            <View
              key={`${node.id}-${index}`}
              pointerEvents="none"
              style={[
                styles.routeNode,
                node.category === 'waypoint' && styles.waypoint,
                isStart && styles.routeStart,
                isEnd && styles.routeEnd,
                { left: `${node.x}%`, top: `${node.y}%` },
              ]}
            >
              {(isStart || isEnd) && (
                <Text numberOfLines={1} style={styles.routeLabel}>{isStart ? 'Đi' : 'Đến'}</Text>
              )}
            </View>
          );
        })}
        {markers.map(marker => {
          const isStart = marker.id === routeStartId;
          const isEnd = marker.id === routeEndId;
          const active = selectedId === marker.id || isStart || isEnd;
          const color = isStart ? '#047857' : isEnd ? '#DC2626' : marker.color;
          return (
            <View
              key={marker.id}
              style={[
                styles.marker,
                {
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  zIndex: active ? 4 : 2,
                  width: 44 * markerScale,
                  height: 58 * markerScale,
                  marginLeft: -22 * markerScale,
                  marginTop: -54 * markerScale,
                },
              ]}
            >
              {active && <Text numberOfLines={1} style={[
                styles.markerLabel,
                {
                  bottom: 47 * markerScale,
                  maxWidth: 140 * markerScale,
                  paddingHorizontal: 8 * markerScale,
                  paddingVertical: 5 * markerScale,
                  borderRadius: 12 * markerScale,
                  fontSize: 10 * markerScale,
                },
              ]}>{marker.title}</Text>}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={marker.title}
                accessibilityState={{ selected: active }}
                onPress={() => onSelectMarker(marker.id)}
                style={[
                  styles.markerPin,
                  { backgroundColor: color },
                  {
                    width: (active ? 40 : 36) * markerScale,
                    height: (active ? 40 : 36) * markerScale,
                    marginBottom: (active ? 3 : 5) * markerScale,
                    borderWidth: (active ? 3 : 2) * markerScale,
                    borderRadius: 20 * markerScale,
                    borderBottomLeftRadius: 3 * markerScale,
                    elevation: active ? 7 : 4,
                  },
                ]}
              >
                <Text style={[styles.markerEmoji, { fontSize: 16 * markerScale }]}>{marker.emoji}</Text>
              </Pressable>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  mapLayer: { position: 'absolute' },
  mapImage: { position: 'absolute', top: 0, left: 0 },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerLabel: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    color: '#202823',
    fontWeight: '600',
    textAlign: 'center',
    elevation: 4,
  },
  markerPin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  markerEmoji: {
    transform: [{ rotate: '45deg' }],
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  routeSegment: {
    position: 'absolute',
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeSegmentInner: { width: '100%', height: 4, backgroundColor: '#047857', borderRadius: 2 },
  routeNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 4,
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  waypoint: { width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5 },
  routeStart: { width: 18, height: 18, marginLeft: -9, marginTop: -9, backgroundColor: '#16A34A' },
  routeEnd: { width: 18, height: 18, marginLeft: -9, marginTop: -9, backgroundColor: '#DC2626' },
  routeLabel: {
    position: 'absolute',
    bottom: 20,
    left: -18,
    minWidth: 42,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#202823',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    elevation: 2,
  },
});
