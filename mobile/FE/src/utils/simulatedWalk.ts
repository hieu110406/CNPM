export type WalkPoint = { x: number; y: number };

export function walkPosition(path: readonly WalkPoint[], progress: number): WalkPoint | null {
  if (!path.length) return null;
  const lengths = path.slice(1).map((point, index) => Math.hypot(point.x - path[index].x, point.y - path[index].y));
  let remaining = Math.max(0, Math.min(1, progress)) * lengths.reduce((sum, length) => sum + length, 0);
  for (let index = 0; index < lengths.length; index++) {
    const length = lengths[index];
    if (length > 0 && remaining < length) {
      const ratio = remaining / length;
      return { x: path[index].x + (path[index + 1].x - path[index].x) * ratio,
        y: path[index].y + (path[index + 1].y - path[index].y) * ratio };
    }
    remaining -= length;
  }
  return { x: path[path.length - 1].x, y: path[path.length - 1].y };
}
