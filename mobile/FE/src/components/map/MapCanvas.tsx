import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View, type GestureResponderEvent } from 'react-native';

export type MapCanvasHandle = { zoomBy: (delta: number) => void; reset: () => void };

export default forwardRef<MapCanvasHandle>(function MapCanvas(_, ref) {
  const view = useRef<View>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [scale] = useState(() => new Animated.Value(1));
  const [position] = useState(() => new Animated.ValueXY());
  const frame = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0, zoom: 1 });
  const [handlers, setHandlers] = useState<ReturnType<typeof PanResponder.create> | null>(null);
  const baseHeight = Math.max(layout.height, layout.width * 875 / 1371);
  const baseWidth = baseHeight * 1371 / 875;

  useEffect(() => {
    function apply(x: number, y: number, zoom: number) {
      const f = frame.current;
      const height = Math.max(f.height, f.width * 875 / 1371);
      const limitX = Math.max(0, (height * 1371 / 875 * zoom - f.width) / 2);
      const limitY = Math.max(0, (height * zoom - f.height) / 2);
      current.current = { x: Math.max(-limitX, Math.min(limitX, x)), y: Math.max(-limitY, Math.min(limitY, y)), zoom };
      position.setValue({ x: current.current.x, y: current.current.y });
      scale.setValue(zoom);
    }
    let start = { x: 0, y: 0, zoom: 1, distance: 0, focalX: 0, focalY: 0, count: 0 };
    function point(event: GestureResponderEvent) {
      const [a, b] = event.nativeEvent.touches;
      const f = frame.current;
      return { x: (b ? (a.pageX + b.pageX) / 2 : a.pageX) - f.x - f.width / 2,
        y: (b ? (a.pageY + b.pageY) / 2 : a.pageY) - f.y - f.height / 2,
        distance: b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0 };
    }
    function begin(event: GestureResponderEvent) {
      if (!event.nativeEvent.touches.length) return;
      const p = point(event);
      start = { ...current.current, distance: p.distance, focalX: p.x, focalY: p.y, count: event.nativeEvent.touches.length };
    }
    setHandlers(PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: begin,
      onPanResponderStart: begin,
      onPanResponderEnd: begin,
      onPanResponderMove: event => {
        if (!event.nativeEvent.touches.length) return;
        if (event.nativeEvent.touches.length !== start.count) { begin(event); return; }
        const p = point(event);
        const zoom = start.distance > 0 ? Math.max(1, Math.min(3, start.zoom * p.distance / start.distance)) : start.zoom;
        const ratio = zoom / start.zoom;
        apply(p.x - (start.focalX - start.x) * ratio, p.y - (start.focalY - start.y) * ratio, zoom);
      },
      onPanResponderTerminationRequest: () => false,
    }));
  }, [position, scale]);

  useImperativeHandle(ref, () => ({
    zoomBy(delta) {
      const previous = current.current;
      const zoom = Math.max(1, Math.min(3, previous.zoom + delta));
      const ratio = zoom / previous.zoom;
      const f = frame.current;
      const height = Math.max(f.height, f.width * 875 / 1371);
      const limitX = Math.max(0, (height * 1371 / 875 * zoom - f.width) / 2);
      const limitY = Math.max(0, (height * zoom - f.height) / 2);
      const x = Math.max(-limitX, Math.min(limitX, previous.x * ratio));
      const y = Math.max(-limitY, Math.min(limitY, previous.y * ratio));
      current.current = { x, y, zoom };
      position.setValue({ x, y });
      scale.setValue(zoom);
    },
    reset() { current.current = { x: 0, y: 0, zoom: 1 }; position.setValue({ x: 0, y: 0 }); scale.setValue(1); },
  }), [position, scale]);

  return <View ref={view} collapsable={false} style={styles.canvas} {...handlers?.panHandlers}
    onLayout={event => {
      const { width, height } = event.nativeEvent.layout;
      frame.current = { ...frame.current, width, height };
      setLayout({ width, height });
      view.current?.measureInWindow((x, y) => { frame.current = { ...frame.current, x, y }; });
      current.current = { x: 0, y: 0, zoom: 1 };
      position.setValue({ x: 0, y: 0 }); scale.setValue(1);
    }}>
    <Animated.Image source={require('@/assets/images/zoo-map.png')} resizeMode="contain"
      accessibilityLabel="Bản đồ Thảo Cầm Viên, kéo để di chuyển, chụm hai ngón để zoom"
      style={{ position: 'absolute', width: baseWidth, height: baseHeight,
        left: (layout.width - baseWidth) / 2, top: (layout.height - baseHeight) / 2,
        transform: [{ translateX: position.x }, { translateY: position.y }, { scale }] }} />
  </View>;
});
const styles = StyleSheet.create({ canvas: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' } });
