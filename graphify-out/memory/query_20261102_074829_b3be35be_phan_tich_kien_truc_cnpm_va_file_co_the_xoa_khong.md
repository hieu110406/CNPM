---
type: "query"
date: "2026-11-02T07:48:29.180143+00:00"
question: "Phan tich kien truc CNPM va file co the xoa khong anh huong code base"
contributor: "graphify"
outcome: "useful"
source_nodes: ["MapLegend.jsx", "MapSidePanel.jsx", "destinations.ts", "theme.ts", "mapGraph.js"]
---

# Q: Phan tich kien truc CNPM va file co the xoa khong anh huong code base

## Answer

Expanded graph vocabulary: assets logo hero destinations reset scripts main server dependencies. Graph queried before source verification. Architecture: Vite web, Express backend, Expo mobile, Python translation/audio agent. Mobile imports shared web mapGraph.js. Source/config cross-check identifies 13 unused source/CSS/barrel files (delete coupled groups together) and 17 internal starter assets; full evidence is graphify-out/DELETE_CANDIDATES.md. Entry points, schema.sql read through fs, Expo icon config, mapGraph types, startup scripts and agent module must remain. Sidebar requires removing its barrel export; reset-project requires removing npm script. Public assets and root package files remain conditional. Static findings only; no files deleted. Mobile lint and typecheck passed.

## Outcome

- Signal: useful

## Source Nodes

- MapLegend.jsx
- MapSidePanel.jsx
- destinations.ts
- theme.ts
- mapGraph.js