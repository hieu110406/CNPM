// mapGraph.js
// Quản lý đồ thị waypoint tĩnh và thuật toán Dijkstra tìm đường ngắn nhất giữa các POI

export const WAYPOINTS = [
  { id: "w0", x: 40.04, y: 74.71 },
  { id: "w1", x: 38.77, y: 68.71 },
  { id: "w2", x: 38.04, y: 49.14 },
  { id: "w3", x: 15.7, y: 50.43 },
  { id: "w4", x: 17.52, y: 58.71 },
  { id: "w5", x: 13.42, y: 67.14 },
  { id: "w6", x: 41.68, y: 68 },
  { id: "w7", x: 48.43, y: 74.29 },
  { id: "w8", x: 41.14, y: 49.14 },
  { id: "w9", x: 44.06, y: 43.29 },
  { id: "w10", x: 49.34, y: 61.65 },
  { id: "w11", x: 49.7, y: 52.39 },
  { id: "w12", x: 49.48, y: 46.45 },
  { id: "w13", x: 58.75, y: 45.76 },
  { id: "w14", x: 66.91, y: 46.1 },
  { id: "w15", x: 75.67, y: 47.7 },
  { id: "w16", x: 84.13, y: 52.62 },
  { id: "w17", x: 79.46, y: 58.33 },
  { id: "w18", x: 82.3, y: 64.16 },
  { id: "w19", x: 85.95, y: 67.13 },
  { id: "w20", x: 87.41, y: 58.33 },
  { id: "w21", x: 85.95, y: 73.42 },
  { id: "w22", x: 81.94, y: 68.73 },
  { id: "w23", x: 79.17, y: 73.53 },
  { id: "w24", x: 81.58, y: 81.19 },
  { id: "w25", x: 74.87, y: 83.7 },
  { id: "w26", x: 72.53, y: 88.27 },
  { id: "w27", x: 65.31, y: 87.7 },
  { id: "w28", x: 54.15, y: 89.19 },
  { id: "w29", x: 55.61, y: 81.3 },
  { id: "w30", x: 50.87, y: 80.27 },
  { id: "w31", x: 54.44, y: 72.62 },
  { id: "w32", x: 62.39, y: 72.27 },
  { id: "w33", x: 66.77, y: 72.39 },
  { id: "w34", x: 69.32, y: 70.79 },
  { id: "w35", x: 73.41, y: 74.33 },
  { id: "w36", x: 64.36, y: 80.27 },
  { id: "w37", x: 58.09, y: 52.05 },
  { id: "w38", x: 55.68, y: 55.47 },
  { id: "w39", x: 64.95, y: 52.16 },
  { id: "w40", x: 73.77, y: 53.87 },
  { id: "w41", x: 75.45, y: 58.1 },
  { id: "w42", x: 72.53, y: 61.99 },
  { id: "w43", x: 68.52, y: 64.73 },
  { id: "w44", x: 24.97, y: 75.47 },
  { id: "w45", x: 23.88, y: 68.85 },
  { id: "w46", x: 22.93, y: 60.05 },
  { id: "w47", x: 41.09, y: 88.27 },
  { id: "w48", x: 42.26, y: 35.36 },
  { id: "w49", x: 29.28, y: 25.87 },
  { id: "w50", x: 15.13, y: 45.99 },
  { id: "w51", x: 29.42, y: 35.7 },
  { id: "w52", x: 34.02, y: 44.73 },
  { id: "w53", x: 54.15, y: 63.36 },
  { id: "w54", x: 55.83, y: 60.96 },
  { id: "w55", x: 22.54, y: 22.86 },
  { id: "w56", x: 10.5, y: 47.43 },
  { id: "w57", x: 25.64, y: 35 },
  { id: "w58", x: 15.61, y: 35.43 },
  { id: "w59", x: 12.6, y: 41.86 },
  { id: "w60", x: 19.99, y: 38.14 },
  { id: "w61", x: 28.19, y: 58.43 },
  { id: "w62", x: 33.3, y: 66.57 },
  { id: "w63", x: 34.94, y: 74.97 },
  { id: "w64", x: 33.11, y: 59.14 },
  { id: "w65", x: 29.56, y: 53.43 },
  { id: "w66", x: 33.48, y: 52.43 },
  { id: "w67", x: 36.76, y: 54.71 },
  { id: "w68", x: 37.49, y: 70.43 },
  { id: "w69", x: 37.76, y: 74.83 },
  { id: "w70", x: 38.25, y: 54.84 },
];

export const EDGES = [
  ["w0", "w1"],
  ["w2", "w3"],
  ["w3", "w4"],
  ["w4", "w5"],
  ["w6", "w0"],
  ["w0", "w7"],
  ["w8", "w6"],
  ["w8", "w2"],
  ["w9", "w8"],
  ["w10", "w7"],
  ["w10", "w11"],
  ["w11", "w12"],
  ["w12", "w9"],
  ["w12", "w13"],
  ["w13", "w14"],
  ["w14", "w15"],
  ["w16", "w15"],
  ["w16", "w17"],
  ["w17", "w18"],
  ["w16", "w20"],
  ["w20", "w19"],
  ["w21", "w19"],
  ["w18", "w22"],
  ["w22", "w23"],
  ["w23", "w24"],
  ["w24", "w25"],
  ["w25", "w26"],
  ["w26", "w27"],
  ["w27", "w28"],
  ["w28", "w29"],
  ["w29", "w30"],
  ["w30", "w7"],
  ["w7", "w31"],
  ["w31", "w32"],
  ["w32", "w33"],
  ["w33", "w34"],
  ["w34", "w35"],
  ["w35", "w25"],
  ["w27", "w36"],
  ["w36", "w29"],
  ["w37", "w13"],
  ["w37", "w38"],
  ["w37", "w39"],
  ["w39", "w14"],
  ["w39", "w40"],
  ["w40", "w15"],
  ["w40", "w41"],
  ["w41", "w17"],
  ["w41", "w42"],
  ["w42", "w43"],
  ["w43", "w34"],
  ["w33", "w36"],
  ["w44", "w45"],
  ["w45", "w46"],
  ["w46", "w4"],
  ["w46", "w44"],
  ["w0", "w47"],
  ["w48", "w9"],
  ["w48", "w49"],
  ["w3", "w50"],
  ["w52", "w51"],
  ["w52", "w50"],
  ["w52", "w2"],
  ["w53", "w10"],
  ["w53", "w31"],
  ["w53", "w54"],
  ["w54", "w38"],
  ["w37", "w11"],
  ["w55", "w49"],
  ["w56", "w50"],
  ["w57", "w51"],
  ["w59", "w50"],
  ["w60", "w58"],
  ["w60", "w57"],
  ["w61", "w46"],
  ["w62", "w45"],
  ["w44", "w63"],
  ["w62", "w63"],
  ["w62", "w64"],
  ["w64", "w61"],
  ["w65", "w61"],
  ["w65", "w66"],
  ["w66", "w67"],
  ["w67", "w68"],
  ["w63", "w69"],
  ["w69", "w0"],
  ["w68", "w69"],
  ["w1", "w70"],
  ["w70", "w2"],
  ["w67", "w70"],
];

// Hàm tính khoảng cách Euclid giữa hai toạ độ (x, y)
function getDistance(a, b) {
  return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

// Bảng tra cứu toạ độ waypoint tĩnh
const WAYPOINT_MAP = new Map(
  WAYPOINTS.map((wp) => [
    wp.id,
    {
      id: wp.id,
      name: wp.id,
      x: Number(wp.x),
      y: Number(wp.y),
      category: "waypoint",
    },
  ])
);

// Danh sách kề của đồ thị tĩnh gồm các waypoint (tính 1 lần duy nhất)
const STATIC_WAYPOINT_ADJ = new Map();
for (const wp of WAYPOINTS) {
  STATIC_WAYPOINT_ADJ.set(wp.id, []);
}

for (const [uId, vId] of EDGES) {
  const u = WAYPOINT_MAP.get(uId);
  const v = WAYPOINT_MAP.get(vId);
  if (u && v) {
    const dist = getDistance(u, v);
    STATIC_WAYPOINT_ADJ.get(uId).push({ to: vId, weight: dist });
    STATIC_WAYPOINT_ADJ.get(vId).push({ to: uId, weight: dist });
  }
}

// Trạng thái đồ thị lúc chạy (gồm waypoints + POIs)
let activeGraphAdj = new Map();
let activeNodeMap = new Map();

/**
 * Dựng đồ thị khi khởi động hoặc khi danh sách POI thay đổi (thêm/xoá/sửa)
 * Không cần tính lại đồ thị waypoint tĩnh, chỉ cần nhân bản và nối các POI vào waypoint gần nhất.
 * @param {Array} pois - Danh sách POI từ database
 */
export function buildGraph(pois = []) {
  const newAdj = new Map();
  const newNodeMap = new Map(WAYPOINT_MAP);

  // 1. Sao chép danh sách kề tĩnh của các waypoint
  for (const [wpId, neighbors] of STATIC_WAYPOINT_ADJ.entries()) {
    newAdj.set(wpId, [...neighbors]);
  }

  // 2. Thêm từng POI và nối vào waypoint gần nhất (hoặc waypoint_id nếu có)
  for (const poi of pois) {
    if (!poi || !poi.id) continue;
    const poiX = Number(poi.x);
    const poiY = Number(poi.y);
    if (!Number.isFinite(poiX) || !Number.isFinite(poiY)) continue;

    const poiNode = {
      id: poi.id,
      name: poi.name || poi.id,
      x: poiX,
      y: poiY,
      category: poi.type || poi.category || "poi",
    };

    newNodeMap.set(poi.id, poiNode);
    if (!newAdj.has(poi.id)) {
      newAdj.set(poi.id, []);
    }

    // Xác định waypoint để nối
    let targetWp = null;
    if (poi.waypoint_id && WAYPOINT_MAP.has(poi.waypoint_id)) {
      targetWp = WAYPOINT_MAP.get(poi.waypoint_id);
    } else {
      // Tìm waypoint gần nhất
      let minDist = Infinity;
      for (const wp of WAYPOINTS) {
        const d = getDistance(poiNode, wp);
        if (d < minDist) {
          minDist = d;
          targetWp = wp;
        }
      }
    }

    if (targetWp) {
      const weight = getDistance(poiNode, targetWp);
      newAdj.get(poi.id).push({ to: targetWp.id, weight });
      newAdj.get(targetWp.id).push({ to: poi.id, weight });
    }
  }

  activeGraphAdj = newAdj;
  activeNodeMap = newNodeMap;

  return { graph: activeGraphAdj, nodes: activeNodeMap };
}

// Khởi tạo đồ thị rỗng ban đầu với các waypoint
buildGraph([]);

/**
 * Tìm đường đi ngắn nhất giữa 2 POI bằng thuật toán Dijkstra
 * @param {string} fromPoiId - ID của POI xuất phát
 * @param {string} toPoiId - ID của POI đích
 * @returns {Object|null} { path: Array, totalDistance: number, stepsCount: number } hoặc null nếu không có đường
 */
export function shortestPath(fromPoiId, toPoiId) {
  if (!fromPoiId || !toPoiId) return null;
  if (!activeNodeMap.has(fromPoiId) || !activeNodeMap.has(toPoiId)) return null;

  if (fromPoiId === toPoiId) {
    const node = activeNodeMap.get(fromPoiId);
    return {
      path: [node],
      totalDistance: 0,
      stepsCount: 0,
    };
  }

  const distances = new Map();
  const previous = new Map();
  const visited = new Set();

  distances.set(fromPoiId, 0);

  // Dijkstra trực tiếp với khoảng ~100 node
  while (true) {
    let closestNode = null;
    let shortestDist = Infinity;

    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < shortestDist) {
        shortestDist = dist;
        closestNode = nodeId;
      }
    }

    if (!closestNode || shortestDist === Infinity) {
      break;
    }

    if (closestNode === toPoiId) {
      break; // Đã tìm thấy đích
    }

    visited.add(closestNode);

    const neighbors = activeGraphAdj.get(closestNode) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const alt = shortestDist + edge.weight;
      const currentDist = distances.get(edge.to) ?? Infinity;

      if (alt < currentDist) {
        distances.set(edge.to, alt);
        previous.set(edge.to, closestNode);
      }
    }
  }

  const totalDistance = distances.get(toPoiId);
  if (totalDistance === undefined || totalDistance === Infinity) {
    return null; // Không có đường đi nối 2 điểm
  }

  // Tái hiện đường đi từ đích ngược về nguồn
  const pathIds = [];
  let curr = toPoiId;
  while (curr !== undefined) {
    pathIds.unshift(curr);
    curr = previous.get(curr);
  }

  if (pathIds[0] !== fromPoiId) {
    return null;
  }

  const path = pathIds.map((id) => activeNodeMap.get(id)).filter(Boolean);

  return {
    path,
    totalDistance,
    stepsCount: path.length - 1,
  };
}
