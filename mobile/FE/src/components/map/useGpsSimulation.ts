import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';
import type { MapGraphNode } from '../../../../../app/FE/src/components/map/mapGraph';
import { mapToGpsCoordinates, type GpsCoordinates, type GpsMapAnchor } from '@/utils/gpsMapCalibration';
import { walkPosition } from '@/utils/simulatedWalk';

export default function useGpsSimulation(anchors: readonly GpsMapAnchor[]) {
  const [path, setPath] = useState<MapGraphNode[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const progressRef = useRef(0);
  const [fixedGps, setFixedGps] = useState<GpsCoordinates | null>(null);
  const stop = useCallback(() => {
    setRunning(false);
    setPath([]);
    setFixedGps(null);
    setProgress(0);
    progressRef.current = 0;
  }, []);
  useFocusEffect(useCallback(() => stop, [stop]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') setRunning(false);
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!running) return;
    let previous = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      progressRef.current = Math.min(1, progressRef.current + (now - previous) / 40000);
      previous = now;
      setProgress(progressRef.current);
      if (progressRef.current >= 1) setRunning(false);
    }, 100);
    return () => clearInterval(timer);
  }, [running]);
  const position = walkPosition(path, progress);
  const gps = fixedGps || (position ? mapToGpsCoordinates(position.x, position.y, anchors) : null);
  return {
    path, progress, running, gps, active: path.length > 0, stop,
    inject: (coordinates: GpsCoordinates) => { setRunning(false); setFixedGps(coordinates); },
    start: (nextPath: MapGraphNode[]) => {
      progressRef.current = 0;
      setProgress(0);
      setFixedGps(null);
      setPath(nextPath.map(point => ({ ...point })));
      setRunning(true);
    },
    toggle: () => {
      setFixedGps(null);
      if (progressRef.current >= 1) { progressRef.current = 0; setProgress(0); }
      setRunning(value => !value);
    },
    reset: () => { setFixedGps(null); setRunning(false); progressRef.current = 0; setProgress(0); },
  };
}
