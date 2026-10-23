import { query } from "../db/database.js";
import VI from "../I18N/vi.js";
import EN from "../I18N/en.js";
import ZH from "../I18N/zh.js";

const ROUTE_TRANSLATIONS = { vi: VI.route, en: EN.route, zh: ZH.route };

function getRouteTranslations(req) {
  const queryLanguage = typeof req.query.lang === "string"
    ? req.query.lang.split("-")[0].toLowerCase()
    : "";
  const headerLanguage = req.get("accept-language")
    ?.split(",")[0]
    .split("-")[0]
    .toLowerCase();
  return ROUTE_TRANSLATIONS[queryLanguage] || ROUTE_TRANSLATIONS[headerLanguage] || ROUTE_TRANSLATIONS.vi;
}

function sendRouteError(res, status, code, message) {
  return res.status(status).json({ code, message });
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }
  dequeue() {
    return this.values.shift();
  }
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
  isEmpty() {
    return this.values.length === 0;
  }
}

export async function listNodes(req, res) {
  try {
    const { rows } = await query("SELECT node_id, name, x, y, category FROM map_node WHERE category != 'waypoint' ORDER BY name ASC");
    res.json({ nodes: rows });
  } catch (error) {
    console.error("Lỗi listNodes:", error);
    res.status(500).json({ error: "Không thể lấy danh sách các điểm bản đồ." });
  }
}

export async function findShortestPath(req, res) {
  const isRouteApi = req.method === "GET";
  const { from, to } = isRouteApi ? req.query : req.body;
  const translations = isRouteApi ? getRouteTranslations(req) : null;

  if (isRouteApi && (
    typeof from !== "string" ||
    typeof to !== "string" ||
    !from.trim() ||
    !to.trim()
  )) {
    return sendRouteError(res, 400, "ROUTE_SELECTION_REQUIRED", translations.errorMissingPoint);
  }

  if (isRouteApi && from === to) {
    return sendRouteError(res, 400, "ROUTE_SAME_POI", translations.errorSamePoint);
  }

  if (!from || !to) {
    return res.status(400).json({ error: "Thiếu điểm xuất phát hoặc điểm đến." });
  }

  if (from === to) {
    try {
      const { rows } = await query("SELECT node_id, name, x, y, category FROM map_node WHERE node_id = $1", [from]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Điểm không tồn tại." });
      }
      return res.json({
        path: rows.map((r) => ({ ...r, id: r.node_id, code: r.node_id })),
        totalDistance: 0,
        totalWeight: 0,
        distanceMeters: 0,
        estimatedMinutes: 0,
        steps: [`Bạn đã ở ngay tại ${rows[0].name}.`],
        stepsCount: 0,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  try {
    // 1. Lấy toàn bộ nodes và edges từ DB
    const [nodesRes, edgesRes, poisRes] = await Promise.all([
      query("SELECT node_id, name, x, y, category FROM map_node"),
      query("SELECT from_id, to_id, distance FROM map_edge"),
      query(`SELECT p.code AS node_id, p.name, p.x, p.y, c.name AS category
             FROM poi p LEFT JOIN category c ON c.category_id = p.category_id
             WHERE p.is_active = TRUE AND p.x IS NOT NULL AND p.y IS NOT NULL`),
    ]);

    const nodesMap = new Map();
    nodesRes.rows.forEach((n) => nodesMap.set(n.node_id, n));
    // The poi table owns POI coordinates; map_node may still contain older values.
    poisRes.rows.forEach((n) => nodesMap.set(n.node_id, n));
    const poiIds = new Set(poisRes.rows.map((n) => n.node_id));

    if (!nodesMap.has(from) || !nodesMap.has(to)) {
      if (isRouteApi) {
        return sendRouteError(res, 404, "ROUTE_POI_NOT_FOUND", translations.errorNotFound);
      }
      return res.status(404).json({ error: "Điểm xuất phát hoặc điểm đến không hợp lệ." });
    }

    // 2. Xây dựng đồ thị kề (adjacency list)
    const adj = new Map();
    for (const n of nodesMap.values()) {
      adj.set(n.node_id, []);
    }
    for (const e of edgesRes.rows) {
      if (adj.has(e.from_id) && adj.has(e.to_id) && !poiIds.has(e.from_id) && !poiIds.has(e.to_id)) {
        adj.get(e.from_id).push({ node: e.to_id, weight: Number(e.distance) });
      }
    }

    // Connect active POIs to the nearest waypoint without modifying stored graph data.
    const waypoints = [...nodesMap.values()].filter((node) => node.category === "waypoint");
    for (const poi of poisRes.rows) {
      let nearest = null;
      let distance = Infinity;
      for (const waypoint of waypoints) {
        const candidate = Math.hypot(Number(poi.x) - Number(waypoint.x), Number(poi.y) - Number(waypoint.y));
        if (candidate < distance) { nearest = waypoint; distance = candidate; }
      }
      if (nearest) {
        adj.get(poi.node_id).push({ node: nearest.node_id, weight: distance });
        adj.get(nearest.node_id).push({ node: poi.node_id, weight: distance });
      }
    }

    // 3. Chạy thuật toán Dijkstra
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();

    for (const node of nodesMap.values()) {
      const id = node.node_id;
      if (id === from) {
        distances[id] = 0;
        pq.enqueue(id, 0);
      } else {
        distances[id] = Infinity;
      }
      previous[id] = null;
    }

    while (!pq.isEmpty()) {
      const { val: current, priority: currentDist } = pq.dequeue();

      if (current === to) break;
      if (currentDist > distances[current]) continue;

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
          pq.enqueue(neighbor.node, alt);
        }
      }
    }

    if (distances[to] === Infinity) {
      if (isRouteApi) {
        return sendRouteError(res, 422, "ROUTE_NOT_FOUND", translations.errorNoRoute);
      }
      return res.status(404).json({ error: "Không tìm thấy đường đi giữa hai điểm này." });
    }

    // 4. Truy vết đường đi
    const pathIds = [];
    let curr = to;
    while (curr) {
      pathIds.unshift(curr);
      curr = previous[curr];
    }

    const path = pathIds.map((id) => {
      const n = nodesMap.get(id);
      return {
        ...n,
        id: n.node_id,
        code: n.node_id,
      };
    });
    const totalDistPercent = Math.round(distances[to] * 10) / 10;
    if (isRouteApi) {
      return res.json({
        from,
        to,
        distance: totalDistPercent,
        path: path.map((node) => ({ x: Number(node.x), y: Number(node.y) })),
      });
    }

    // Quy đổi ước tính: 1% đường chéo bản đồ ~ 10-12m
    const distanceMeters = Math.round(distances[to] * 12);
    // Tốc độ đi bộ trung bình 4.5 km/h ~ 75 m/phút
    const estimatedMinutes = Math.max(1, Math.round(distanceMeters / 75));

    // Tạo danh sách các bước chỉ đường
    const steps = [];
    for (let i = 0; i < path.length - 1; i++) {
      const currNode = path[i];
      const nextNode = path[i + 1];
      steps.push(`Từ ${currNode.name} đi thẳng tới ${nextNode.name}`);
    }

    res.json({
      path,
      totalDistance: totalDistPercent,
      totalWeight: totalDistPercent,
      distanceMeters,
      estimatedMinutes,
      steps,
      stepsCount: steps.length,
    });
  } catch (error) {
    console.error("Lỗi Dijkstra:", error);
    if (isRouteApi) {
      return sendRouteError(res, 500, "ROUTE_INTERNAL_ERROR", translations.errorGeneric);
    }
    res.status(500).json({ error: "Lỗi hệ thống khi tìm đường đi." });
  }
}
