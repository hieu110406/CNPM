# Graph Report - CNPM  (2026-11-02)

## Corpus Check
- 165 files · ~72,368 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: (none) 28, .css 10, .example 2)

## Summary
- 883 nodes · 1624 edges · 96 communities (53 shown, 43 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Mobile APIs and Analytics
- Translation Model Service
- Zoo Waypoint Routing
- POI Administration
- Expo App Configuration
- Web Map Rendering
- Backend Dependencies
- GPS Presence Lifecycle
- Zoo Database Schema
- Product Requirements
- Backend Route Finding
- Development Startup
- Web UI Dependencies
- Animal Details and Audio
- Language and Settings
- Admin Dashboard
- Backend Route Registration
- Web Lint Configuration
- Web API Client
- Expo Runtime Dependencies
- Database and Route Seeding
- Translation and Speech Agent
- Web App Session
- Mobile Map Canvas
- Expo Package Scripts
- Monorepo Development Scripts
- Mobile TypeScript Tooling
- Visitor Analytics
- Web Layout Navigation
- Mobile Zoo Navigation
- Expo Project Reset
- Audio Track Management
- Mobile Deployment Architecture
- Root Mobile Scripts
- Admin Access Control
- Vite Build Configuration
- Web Audio Playback
- GPS Validation Report
- Mobile Theme Tokens
- TypeScript Path Aliases
- Social Icon Sprite
- Internationalization Strategy
- Vercel Web Deployment
- Authentication and Auditing
- Proposed Frontend Architecture
- React Raster Branding
- Backend Run Scripts
- Web Run Scripts
- Web Zoo Map
- Expo Visual Branding
- Expo Lint Configuration
- Map Graph Types
- Expo Development Guidance
- Supabase Client Dependency
- Map Destination Data
- Graphify Navigation Rules
- React Type Definitions
- Vite Visual Branding
- Expo Favicon Branding
- Expo Application Branding
- Decorative Logo Glow
- Expo Splash Branding
- Explore Navigation Icons
- Explore Navigation Icons
- Explore Navigation Icons
- Home Navigation Icons
- Home Navigation Icons
- Home Navigation Icons
- Expo Starter Tutorial
- Mobile Zoo Map
- expo audio Dependency
- expo constants Dependency
- expo device Dependency
- expo font Dependency
- expo glass effect Dependency
- expo image Dependency
- expo linking Dependency
- expo location Dependency
- expo splash screen Dependency
- expo status bar Dependency
- expo symbols Dependency
- expo system ui Dependency
-  Dependency
- react dom Dependency
- react native web Dependency
- react native worklets Dependency
- CSS Module Types
- Web HTML Entry
- Hero Illustration
- Zoo Deer Emblem
- React Vector Branding
- Standalone Route Edges
- Standalone Zoo Waypoints
- Circular Grid Texture
- Android Icon Background
- Android Icon Foreground

## God Nodes (most connected - your core abstractions)
1. `query()` - 29 edges
2. `ZooMap()` - 26 edges
3. `useSettings()` - 25 edges
4. `lucide-react` - 22 edges
5. `ZooMap()` - 21 edges
6. `useI18n()` - 21 edges
7. `react-native` - 18 edges
8. `Automated Audio Guide Product Requirements` - 18 edges
9. `AppIcon()` - 14 edges
10. `shortestPath()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Session Only VI EN ZH Translation Context` --semantically_similar_to--> `Cross Platform Internationalization`  [INFERRED] [semantically similar]
  mobile/FE/README.md → I18N_GUIDE.md
- `UC3 Language Settings and Offline Package` --conceptually_related_to--> `Cross Platform Internationalization`  [INFERRED]
  PRD/PRD.pdf → I18N_GUIDE.md
- `Proposed Web Frontend Organization` --semantically_similar_to--> `Proposed Modular Project Architecture`  [INFERRED] [semantically similar]
  app/FE/README.md → README.md
- `UC6 Audio and AI Content Management` --conceptually_related_to--> `POI Translation and Audio Agent`  [INFERRED]
  PRD/PRD.pdf → app/agent/README.md
- `UC1 Explore Map and Navigate to POI` --conceptually_related_to--> `Shared Web and Mobile Waypoint Graph`  [INFERRED]
  PRD/PRD.pdf → mobile/FE/README.md

## Import Cycles
- None detected.

## Communities (96 total, 43 thin omitted)

### Community 0 - "Mobile APIs and Analytics"
Cohesion: 0.05
Nodes (71): getMostListenedPois(), pingOnlineSession(), PopularPoi, removeOnlineSession(), getApiBase(), getMapPois(), MapApiError, MapNode (+63 more)

### Community 1 - "Translation Model Service"
Cohesion: 0.07
Nodes (17): get_translation_model(), health(), LanguageTranslation, LocalizedPoiField, parse_json_response(), PoiDescriptions, PoiFields, PoiTranslationApiResponse (+9 more)

### Community 2 - "Zoo Waypoint Routing"
Cohesion: 0.08
Nodes (36): activeGraphAdj, activeNodeMap, buildGraph(), EDGES, getDistance(), shortestPath(), STATIC_WAYPOINT_ADJ, WAYPOINT_MAP (+28 more)

### Community 3 - "POI Administration"
Cohesion: 0.15
Nodes (26): createPoi(), deletePoi(), getCategoryId(), LANGUAGES, listPois(), listPublicPois(), readPoiInput(), readPoiRequestBody() (+18 more)

### Community 4 - "Expo App Configuration"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+16 more)

### Community 5 - "Web Map Rendering"
Cohesion: 0.18
Nodes (12): buildSmoothPath(), MapCanvas(), MapControls(), FILTER_CATEGORIES, HIGHLIGHT_GROUPS, MARKERS, TYPE_META, MapLegend() (+4 more)

### Community 6 - "Backend Dependencies"
Cohesion: 0.13
Nodes (21): dependencies, bcryptjs@^2.4.3, cors@^2.8.5, dotenv@^16.4.5, jsonwebtoken@^9.0.2, multer@^2.4.0, pg@^8.13.1, seed@^0.4.4 (+13 more)

### Community 7 - "GPS Presence Lifecycle"
Cohesion: 0.15
Nodes (15): setup(), createPositionWatcher(), start(), stop(), PositionSubscribe, PositionSubscription, createPresenceHeartbeat(), close() (+7 more)

### Community 8 - "Zoo Database Schema"
Cohesion: 0.17
Nodes (18): admin_account, audio_track, audit_log, category, idx_audio_poi, idx_audit_admin, idx_online_session_last_seen, idx_usage_lang (+10 more)

### Community 9 - "Product Requirements"
Cohesion: 0.21
Nodes (19): Zoo Admin Persona, Anonymous Usage Logs and Analytics, Human Review of AI Translations and TTS, Geofence Debounce and Exit Radius, Local GPS Processing and No Route History, Admin MFA and Role Permissions, Nearest Unplayed POI Selection, Offline Map and Audio Package (+11 more)

### Community 10 - "Backend Route Finding"
Cohesion: 0.18
Nodes (9): findShortestPath(), getRouteTranslations(), listNodes(), PriorityQueue, ROUTE_TRANSLATIONS, sendRouteError(), EN, VI (+1 more)

### Community 11 - "Development Startup"
Cohesion: 0.13
Nodes (13): config, { getDefaultConfig }, path, backendDir, children, frontendDir, fs, healthy() (+5 more)

### Community 12 - "Web UI Dependencies"
Cohesion: 0.15
Nodes (16): dependencies, i18next@^26.4.2, lucide-react@^1.48.0, react@^19.2.8, react-dom@^19.2.8, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, react (+8 more)

### Community 13 - "Animal Details and Audio"
Cohesion: 0.29
Nodes (9): PoiAudioControl(), toAudioLanguage(), AnimalDetailModal(), getMarkerDetails(), MARKER_DETAILS, MapInfoCard(), RoutePickerModal(), RoutePickerModalInner() (+1 more)

### Community 14 - "Language and Settings"
Cohesion: 0.14
Nodes (6): LanguageSwitcher(), FONT_SIZES, FONTS, LANGUAGES, LEGACY_KEY_MAP, SettingsContext

### Community 15 - "Admin Dashboard"
Cohesion: 0.18
Nodes (12): AdminDashboard(), CATEGORY_OPTIONS, DEFAULT_POI_ZONES, getAudioDuration(), getPoiTranslationRequest(), getPoiTranslations(), getPoiTranslationSource(), LANGUAGES (+4 more)

### Community 16 - "Backend Route Registration"
Cohesion: 0.18
Nodes (11): listAudit(), express@^4.19.2, r, router, r, r, r, router (+3 more)

### Community 17 - "Web Lint Configuration"
Cohesion: 0.16
Nodes (13): devDependencies, eslint@^10.10.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.6, globals@^17.12.0, @types/react-dom@^19.2.7, eslint (+5 more)

### Community 18 - "Web API Client"
Cohesion: 0.17
Nodes (6): api, getToken(), request(), requestFormData(), TRANSLATION_API_URL, HighlightedZones()

### Community 19 - "Expo Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo@~58.0.17, expo-router@~58.0.25, expo-web-browser@~58.0.6, react@19.3.0, react-native@0.88.0, react-native-gesture-handler@~3.3.0, react-native-reanimated@4.7.1 (+7 more)

### Community 20 - "Database and Route Seeding"
Cohesion: 0.23
Nodes (10): __dirname, initDb(), pool, dist(), EDGES, POI_NODES, seedPathfinding(), WAYPOINTS (+2 more)

### Community 21 - "Translation and Speech Agent"
Cohesion: 0.15
Nodes (13): POI Translation and Audio Agent, Admin POI Translation Text Download, 9Router OpenAI Compatible Speech, Render Hosted Agent, Supabase Audio Storage, POI English and Chinese Translation, Vietnamese Script Translation, Three Language MP3 Generation (+5 more)

### Community 22 - "Web App Session"
Cohesion: 0.26
Nodes (7): App(), AppContent(), createSessionId(), AdminLogin(), OfflineNotice(), useNetworkStatus(), SettingsProvider()

### Community 23 - "Mobile Map Canvas"
Cohesion: 0.21
Nodes (10): apply(), begin(), getMapSize(), getPanLimits(), MapCanvasHandle, MapCanvasProps, MapMarker, point() (+2 more)

### Community 24 - "Expo Package Scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, android, build:web, ios, lint, start (+4 more)

### Community 25 - "Monorepo Development Scripts"
Cohesion: 0.18
Nodes (11): devDependencies, concurrently@^9.2.4, name, private, scripts, dev, dev:agent, dev:be (+3 more)

### Community 26 - "Mobile TypeScript Tooling"
Cohesion: 0.21
Nodes (11): devDependencies, eslint@^9.0.0, @types/react@~19.3.0, typescript@~6.0.3, eslint, @types/react, main, name (+3 more)

### Community 27 - "Visitor Analytics"
Cohesion: 0.55
Nodes (9): cleanupSessions(), exportOverview(), getActiveSessions(), getOverview(), logAudioUsage(), pingSession(), removeSession(), resetAudioUsage() (+1 more)

### Community 28 - "Web Layout Navigation"
Cohesion: 0.27
Nodes (6): AppLayout(), Header(), NAV_ITEMS, NavItem(), Sidebar(), SettingsModal()

### Community 29 - "Mobile Zoo Navigation"
Cohesion: 0.18
Nodes (3): MapSearchBar(), ZooMap(), selectRouteMarker()

### Community 30 - "Expo Project Reset"
Cohesion: 0.18
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 31 - "Audio Track Management"
Cohesion: 0.38
Nodes (7): createAudio(), deleteAudio(), LANGUAGES, listAudio(), listPublicAudio(), sendAudioError(), audioUpload

### Community 32 - "Mobile Deployment Architecture"
Cohesion: 0.22
Nodes (9): Idempotent Default POI Seeding, Public Active POI API, Static Web POI Fallback, Backend and Expo Startup Launcher, Saigon Zoo Expo Mobile Frontend, Session Only VI EN ZH Translation Context, Backend Neon POI Database, Expo SDK 58 Compatibility (+1 more)

### Community 33 - "Root Mobile Scripts"
Cohesion: 0.22
Nodes (9): scripts, android, build:web, ios, lint, reset-project, start, start:fe (+1 more)

### Community 34 - "Admin Access Control"
Cohesion: 0.43
Nodes (5): createAdmin(), deactivateAdmin(), listAdmins(), updateAdmin(), requireAuth()

### Community 35 - "Vite Build Configuration"
Cohesion: 0.25
Nodes (5): vite@^8.3.0, @vitejs/plugin-react@^6.1.1, __dirname, vite, @vitejs/plugin-react

### Community 37 - "GPS Validation Report"
Cohesion: 0.25
Nodes (8): On Device Dijkstra Route Finding, Shared Web and Mobile Waypoint Graph, Missing Zebra Calibration Landmark, Unverified Real Device GPS and UI, Synthetic GPS Projection Checks, GPS Test Execution Report, Foreground GPS Subscription Lifecycle, Route Polyline Simulation Checks

### Community 38 - "Mobile Theme Tokens"
Cohesion: 0.25
Nodes (6): BottomTabInset, Colors, Fonts, MaxContentWidth, Spacing, ThemeColor

### Community 39 - "TypeScript Path Aliases"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, strict, extends, include, @/assets/*, expo/tsconfig.base

### Community 40 - "Social Icon Sprite"
Cohesion: 0.29
Nodes (7): Bluesky, Discord, Documentation, GitHub, Social, Social and documentation icon sprite, X

### Community 41 - "Internationalization Strategy"
Cohesion: 0.38
Nodes (7): Interpolation Pluralization and Locale Formatting, Cross Platform Internationalization, i18next Translation Core, Mobile Localization and AsyncStorage, react-i18next React Binding, Synchronized Translation Keys, Web Language Detection and localStorage

### Community 42 - "Vercel Web Deployment"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, framework, installCommand, outputDirectory, $schema

### Community 43 - "Authentication and Auditing"
Cohesion: 0.67
Nodes (4): logAudit(), login(), logout(), me()

### Community 44 - "Proposed Frontend Architecture"
Cohesion: 0.33
Nodes (4): Reusable UI Components, Business Feature Modules, Custom Hooks, API and Data Services

### Community 45 - "React Raster Branding"
Cohesion: 0.33
Nodes (6): React Branding, React Logo 2x, React Branding, React Logo 3x, React Branding, React Logo

### Community 46 - "Backend Run Scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, seed, seed:pois, start

### Community 47 - "Web Run Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 48 - "Web Zoo Map"
Cohesion: 0.40
Nodes (5): Animal zones, Saigon Zoo illustrated map, Thao Cam Vien Saigon, Visitor amenities, Zoo visitor paths

### Community 49 - "Expo Visual Branding"
Cohesion: 0.40
Nodes (5): Expo vector symbol, Android monochrome chevron, Expo powered badge, White Expo powered badge, Expo white logo

### Community 50 - "Expo Lint Configuration"
Cohesion: 0.40
Nodes (4): { defineConfig }, expoConfig, eslint-config-expo@~58.0.4, eslint-config-expo

### Community 51 - "Map Graph Types"
Cohesion: 0.50
Nodes (3): MapGraphNode, MapGraphPath, MapGraphPoi

### Community 52 - "Expo Development Guidance"
Cohesion: 0.50
Nodes (4): Continuous Native Generation, EAS Cloud Build and Updates, Expo Version Matched API Documentation, Expo Router Screen Separation

### Community 53 - "Supabase Client Dependency"
Cohesion: 0.67
Nodes (3): dependencies, @supabase/supabase-js@^2.117.3, @supabase/supabase-js

## Knowledge Gaps
- **84 isolated node(s):** `expo/tsconfig.base`, `WAYPOINTS`, `EDGES`, `Graphify Knowledge Graph`, `react-i18next React Binding` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Web Map Rendering` to `Web Audio Playback`, `Web UI Dependencies`, `Animal Details and Audio`, `Language and Settings`, `Admin Dashboard`, `Web API Client`, `Web App Session`, `Web Layout Navigation`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `WAYPOINTS`, `EDGES` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mobile APIs and Analytics` be split into smaller, more focused modules?**
  _Cohesion score 0.052837938760268856 - nodes in this community are weakly interconnected._
- **Why does `MARKERS` connect `Web Map Rendering` to `Database and Route Seeding`, `Animal Details and Audio`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Translation Model Service` be split into smaller, more focused modules?**
  _Cohesion score 0.07342995169082125 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `Mobile APIs and Analytics` to `Zoo Waypoint Routing`, `Mobile Theme Tokens`, `Expo Runtime Dependencies`, `Mobile Map Canvas`, `Mobile TypeScript Tooling`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Zoo Waypoint Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._
## Build limitations

Graph health warning: 36 dangling-endpoint edges, 1 self-loop, and 80 same-endpoint relationships collapsed in the default undirected graph. No missing-endpoint edges.

Semantic token usage is unavailable: zero token counters are placeholders, not measured usage or a claim of zero cost. Five SVGs were inspected as complete vector markup. PRD text was read across all 46 pages; embedded diagrams were not visually reviewed.

`graphify-out/` was written into the working tree and will appear in `git status` unless ignored. Commit the outputs your team should share, or add it to `.gitignore`; see https://docs.graphify.com/guides/team-workflows.
