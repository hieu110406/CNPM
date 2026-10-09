import { query } from "../db/database.js";

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
  const { from, to } = req.body;

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
    const [nodesRes, edgesRes] = await Promise.all([
      query("SELECT node_id, name, x, y, category FROM map_node"),
      query("SELECT from_id, to_id, distance FROM map_edge"),
    ]);

    const nodesMap = new Map();
    nodesRes.rows.forEach((n) => nodesMap.set(n.node_id, n));

    if (!nodesMap.has(from) || !nodesMap.has(to)) {
      return res.status(404).json({ error: "Điểm xuất phát hoặc điểm đến không hợp lệ." });
    }

    // 2. Xây dựng đồ thị kề (adjacency list)
    const adj = new Map();
    for (const n of nodesRes.rows) {
      adj.set(n.node_id, []);
    }
    for (const e of edgesRes.rows) {
      if (adj.has(e.from_id)) {
        adj.get(e.from_id).push({ node: e.to_id, weight: Number(e.distance) });
      }
    }

    // 3. Chạy thuật toán Dijkstra
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();

    for (const node of nodesRes.rows) {
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
    res.status(500).json({ error: "Lỗi hệ thống khi tìm đường đi." });
  }
}
