# Graph Report - CNPM  (2026-11-15)

## Corpus Check
- 138 files · ~75,701 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 41 file(s) not represented in the graph (top: (none) 28, .css 10, .example 2)

## Summary
- 963 nodes · 1798 edges · 101 communities (56 shown, 45 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0af22480`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AnimalDetailPopup.tsx
- Translation Model Service
- Zoo Waypoint Routing
- poi.controller.js
- Expo App Configuration
- Web Map Rendering
- Backend Dependencies
- offline.controller.js
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
- dependencies
- Database and Route Seeding
- Translation and Speech Agent
- Web App Session
- offlineReader.ts
- Expo Package Scripts
- Monorepo Development Scripts
- Mobile TypeScript Tooling
- Visitor Analytics
- Web Layout Navigation
- Mobile Zoo Navigation
- Expo Project Reset
- MapCanvas.tsx
- Mobile Deployment Architecture
- Root Mobile Scripts
- HomeScreen.tsx
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
- ExploreScreen.tsx
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
- AppTabs.tsx
- I18nContext.tsx
- expo device Dependency
- expo font Dependency
- expo glass effect Dependency
- expo image Dependency
- expo linking Dependency
- expo location Dependency
- ZooMap.tsx
- expo status bar Dependency
- map.ts
- expo system ui Dependency
-  Dependency
- react dom Dependency
- expo-splash-screen@~58.0.11
- expo-symbols
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
- Q: Phan tich kien truc CNPM va file co the xoa khong anh huong code base
- expo
- react@19.3.0
- expo-web-browser@~58.0.6
- react-native-web@^0.21.4

## God Nodes (most connected - your core abstractions)
1. `query()` - 25 edges
2. `useSettings()` - 25 edges
3. `ZooMap()` - 23 edges
4. `lucide-react` - 22 edges
5. `useI18n()` - 22 edges
6. `ZooMap()` - 21 edges
7. `react-native` - 20 edges
8. `Automated Audio Guide Product Requirements` - 18 edges
9. `request()` - 14 edges
10. `AppIcon()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Session Only VI EN ZH Translation Context` --semantically_similar_to--> `Cross Platform Internationalization`  [INFERRED] [semantically similar]
  mobile/FE/README.md → I18N_GUIDE.md
- `UC6 Audio and AI Content Management` --conceptually_related_to--> `POI Translation and Audio Agent`  [INFERRED]
  PRD/PRD.pdf → app/agent/README.md
- `UC1 Explore Map and Navigate to POI` --conceptually_related_to--> `Shared Web and Mobile Waypoint Graph`  [INFERRED]
  PRD/PRD.pdf → mobile/FE/README.md
- `UC3 Language Settings and Offline Package` --conceptually_related_to--> `Cross Platform Internationalization`  [INFERRED]
  PRD/PRD.pdf → I18N_GUIDE.md
- `Proposed Web Frontend Organization` --semantically_similar_to--> `Proposed Modular Project Architecture`  [INFERRED] [semantically similar]
  app/FE/README.md → README.md

## Import Cycles
- None detected.

## Communities (101 total, 45 thin omitted)

### Community 0 - "AnimalDetailPopup.tsx"
Cohesion: 0.33
Nodes (9): formatTime(), PoiAudioControl(), styles, TrackPlayer(), AnimalDetailPopup(), styles, AppIcon(), names (+1 more)

### Community 1 - "Translation Model Service"
Cohesion: 0.05
Nodes (22): OllamaTranslationTest, respond(), TranslationErrorsTest, DescriptionTranslations, get_translation_model(), health(), LanguageTranslation, LocalizedPoiField (+14 more)

### Community 2 - "Zoo Waypoint Routing"
Cohesion: 0.06
Nodes (35): activeGraphAdj, activeNodeMap, buildGraph(), EDGES, getDistance(), shortestPath(), STATIC_WAYPOINT_ADJ, WAYPOINT_MAP (+27 more)

### Community 3 - "poi.controller.js"
Cohesion: 0.11
Nodes (36): createAudio(), deleteAudio(), LANGUAGES, listAudio(), listPublicAudio(), sendAudioError(), createPoi(), deletePoi() (+28 more)

### Community 4 - "Expo App Configuration"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+16 more)

### Community 5 - "Web Map Rendering"
Cohesion: 0.16
Nodes (13): buildSmoothPath(), MapCanvas(), MapControls(), FILTER_CATEGORIES, HIGHLIGHT_GROUPS, MARKERS, TYPE_META, MapLegend() (+5 more)

### Community 6 - "Backend Dependencies"
Cohesion: 0.11
Nodes (22): dependencies, bcryptjs@^2.4.3, cors@^2.8.5, dotenv@^16.4.5, pg@^8.13.1, seed@^0.4.4, devDependencies, nodemon@^3.1.7 (+14 more)

### Community 7 - "offline.controller.js"
Cohesion: 0.22
Nodes (10): allowedMediaHost(), downloadOfflinePackage(), addMedia(), extensionFor(), languageFrom(), LANGUAGES, retrieveMedia(), crc32() (+2 more)

### Community 8 - "Zoo Database Schema"
Cohesion: 0.17
Nodes (18): admin_account, audio_track, audit_log, category, idx_audio_poi, idx_audit_admin, idx_online_session_last_seen, idx_usage_lang (+10 more)

### Community 9 - "Product Requirements"
Cohesion: 0.21
Nodes (19): Zoo Admin Persona, Anonymous Usage Logs and Analytics, Human Review of AI Translations and TTS, Geofence Debounce and Exit Radius, Local GPS Processing and No Route History, Admin MFA and Role Permissions, Nearest Unplayed POI Selection, Offline Map and Audio Package (+11 more)

### Community 10 - "Backend Route Finding"
Cohesion: 0.19
Nodes (8): findShortestPath(), getRouteTranslations(), PriorityQueue, ROUTE_TRANSLATIONS, sendRouteError(), EN, VI, ZH

### Community 11 - "Development Startup"
Cohesion: 0.14
Nodes (13): config, { getDefaultConfig }, path, backendDir, children, frontendDir, fs, healthy() (+5 more)

### Community 12 - "Web UI Dependencies"
Cohesion: 0.15
Nodes (16): dependencies, i18next@^26.4.2, lucide-react@^1.48.0, react@^19.2.8, react-dom@^19.2.8, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, react (+8 more)

### Community 13 - "Animal Details and Audio"
Cohesion: 0.29
Nodes (9): PoiAudioControl(), toAudioLanguage(), AnimalDetailModal(), getMarkerDetails(), MARKER_DETAILS, MapInfoCard(), RoutePickerModal(), RoutePickerModalInner() (+1 more)

### Community 14 - "Language and Settings"
Cohesion: 0.18
Nodes (4): LanguageSwitcher(), LANGUAGES, LEGACY_KEY_MAP, SettingsContext

### Community 15 - "Admin Dashboard"
Cohesion: 0.24
Nodes (10): AdminDashboard(), CATEGORY_OPTIONS, DEFAULT_POI_ZONES, getAudioDuration(), getPoiTranslationRequest(), getPoiTranslations(), getPoiTranslationSource(), LANGUAGES (+2 more)

### Community 16 - "Backend Route Registration"
Cohesion: 0.21
Nodes (10): getOfflineMetadata(), listNodes(), express@^4.19.2, router, r, r, router, router (+2 more)

### Community 17 - "Web Lint Configuration"
Cohesion: 0.18
Nodes (13): devDependencies, eslint@^10.10.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.6, globals@^17.12.0, @types/react-dom@^19.2.7, eslint (+5 more)

### Community 18 - "Web API Client"
Cohesion: 0.15
Nodes (6): api, getToken(), request(), requestFormData(), TRANSLATION_API_URL, HighlightedZones()

### Community 19 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, expo-audio@~58.0.10, expo-constants@~58.0.13, expo-file-system@~58.0.13, expo-router@~58.0.25, jszip@^3.10.2, react-native@0.88.0, react-native-gesture-handler@~3.3.0 (+9 more)

### Community 20 - "Database and Route Seeding"
Cohesion: 0.23
Nodes (10): __dirname, initDb(), pool, dist(), EDGES, POI_NODES, seedPathfinding(), WAYPOINTS (+2 more)

### Community 21 - "Translation and Speech Agent"
Cohesion: 0.15
Nodes (13): POI Translation and Audio Agent, Admin POI Translation Text Download, 9Router OpenAI Compatible Speech, Render Hosted Agent, Supabase Audio Storage, POI English and Chinese Translation, Vietnamese Script Translation, Three Language MP3 Generation (+5 more)

### Community 22 - "Web App Session"
Cohesion: 0.33
Nodes (7): App(), AppContent(), createSessionId(), AdminLogin(), OfflineNotice(), useNetworkStatus(), SettingsProvider()

### Community 23 - "offlineReader.ts"
Cohesion: 0.12
Nodes (37): downloadNativePackage(), downloadOfflinePackage(), downloadWebPackage(), getApiBaseUrl(), getWebOfflinePackage(), hasOfflinePackage(), offlinePackagePath(), openOfflineDatabase() (+29 more)

### Community 24 - "Expo Package Scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, android, build:web, ios, lint, start (+4 more)

### Community 25 - "Monorepo Development Scripts"
Cohesion: 0.18
Nodes (11): devDependencies, concurrently@^9.2.5, name, private, scripts, dev, dev:agent, dev:be (+3 more)

### Community 26 - "Mobile TypeScript Tooling"
Cohesion: 0.19
Nodes (13): devDependencies, eslint@^9.0.0, eslint-config-expo@~58.0.4, @types/react@~19.3.0, typescript@~6.0.3, eslint, @types/react, main (+5 more)

### Community 27 - "Visitor Analytics"
Cohesion: 0.55
Nodes (9): cleanupSessions(), exportOverview(), getActiveSessions(), getOverview(), logAudioUsage(), pingSession(), removeSession(), resetAudioUsage() (+1 more)

### Community 28 - "Web Layout Navigation"
Cohesion: 0.20
Nodes (7): offlineDownloadUrl(), AppLayout(), Header(), NAV_ITEMS, NavItem(), Sidebar(), SettingsModal()

### Community 30 - "Expo Project Reset"
Cohesion: 0.18
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 31 - "MapCanvas.tsx"
Cohesion: 0.19
Nodes (11): apply(), begin(), BUNDLED_MAP, getMapSize(), getPanLimits(), loadMapImage(), MapCanvasProps, MapMarker (+3 more)

### Community 32 - "Mobile Deployment Architecture"
Cohesion: 0.22
Nodes (9): Idempotent Default POI Seeding, Public Active POI API, Static Web POI Fallback, Backend and Expo Startup Launcher, Saigon Zoo Expo Mobile Frontend, Session Only VI EN ZH Translation Context, Backend Neon POI Database, Expo SDK 58 Compatibility (+1 more)

### Community 33 - "Root Mobile Scripts"
Cohesion: 0.22
Nodes (9): scripts, android, build:web, ios, lint, reset-project, start, start:fe (+1 more)

### Community 34 - "HomeScreen.tsx"
Cohesion: 0.16
Nodes (14): HomeScreen(), languageOptions, SettingsMenuItem(), styles, visitSteps, AnimatedPressable, AnimatedPressableProps, MotionPressable (+6 more)

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
Cohesion: 0.25
Nodes (7): buildCommand, cleanUrls, framework, headers, installCommand, outputDirectory, $schema

### Community 43 - "Authentication and Auditing"
Cohesion: 0.36
Nodes (7): logAudit(), login(), logout(), me(), requireAuth(), jsonwebtoken@^9.0.2, jsonwebtoken

### Community 44 - "Proposed Frontend Architecture"
Cohesion: 0.33
Nodes (4): Reusable UI Components, Business Feature Modules, Custom Hooks, API and Data Services

### Community 45 - "React Raster Branding"
Cohesion: 0.33
Nodes (6): React Branding, React Logo 2x, React Branding, React Logo 3x, React Branding, React Logo

### Community 46 - "ExploreScreen.tsx"
Cohesion: 0.21
Nodes (13): AnimalPoi, ExploreScreen(), styles, MostListenedPois(), styles, AnimalThumbnail(), photos, Heading() (+5 more)

### Community 47 - "Web Run Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 48 - "Web Zoo Map"
Cohesion: 0.40
Nodes (5): Animal zones, Saigon Zoo illustrated map, Thao Cam Vien Saigon, Visitor amenities, Zoo visitor paths

### Community 49 - "Expo Visual Branding"
Cohesion: 0.40
Nodes (5): Expo vector symbol, Android monochrome chevron, Expo powered badge, White Expo powered badge, Expo white logo

### Community 51 - "Map Graph Types"
Cohesion: 0.50
Nodes (3): MapGraphNode, MapGraphPath, MapGraphPoi

### Community 52 - "Expo Development Guidance"
Cohesion: 0.50
Nodes (4): Continuous Native Generation, EAS Cloud Build and Updates, Expo Version Matched API Documentation, Expo Router Screen Separation

### Community 53 - "Supabase Client Dependency"
Cohesion: 0.67
Nodes (3): dependencies, @supabase/supabase-js@^2.117.3, @supabase/supabase-js

### Community 70 - "AppTabs.tsx"
Cohesion: 0.24
Nodes (9): Layout(), WebServiceWorker(), AppTabs(), Button(), styles, PageTransition(), I18nProvider(), expo-router (+1 more)

### Community 71 - "I18nContext.tsx"
Cohesion: 0.24
Nodes (9): dictionaries, Dictionary, I18nContext, I18nContextValue, MobileLanguage, TranslationKey, en, vi (+1 more)

### Community 78 - "ZooMap.tsx"
Cohesion: 0.22
Nodes (7): MapCanvasHandle, DeviceMapLocation, GPS_FIXED_ANCHORS, GPS_ZEBRA_ANCHOR, mapZoneFilters, styles, normalizeSearch()

### Community 80 - "map.ts"
Cohesion: 0.09
Nodes (34): cachePageAndAssets(), getReferencedAssets(), isStaticAsset(), isValidResponse(), PAGES, sameOrigin(), setup(), getMostListenedPois() (+26 more)

### Community 96 - "Q: Phan tich kien truc CNPM va file co the xoa khong anh huong code base"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Phan tich kien truc CNPM va file co the xoa khong anh huong code base, Source Nodes

## Knowledge Gaps
- **84 isolated node(s):** `expo/tsconfig.base`, `WAYPOINTS`, `EDGES`, `Idempotent Default POI Seeding`, `Admin POI Translation Text Download` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 345 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Web Map Rendering` to `Web Audio Playback`, `Web UI Dependencies`, `Animal Details and Audio`, `Language and Settings`, `Admin Dashboard`, `Web API Client`, `Web App Session`, `Web Layout Navigation`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `WAYPOINTS`, `EDGES` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Translation Model Service` be split into smaller, more focused modules?**
  _Cohesion score 0.05336951605608322 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `ExploreScreen.tsx` to `AnimalDetailPopup.tsx`, `HomeScreen.tsx`, `AppTabs.tsx`, `Mobile Theme Tokens`, `ZooMap.tsx`, `map.ts`, `dependencies`, `offlineReader.ts`, `Mobile TypeScript Tooling`, `MapCanvas.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Zoo Waypoint Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06294326241134751 - nodes in this community are weakly interconnected._
- **Why does `MARKERS` connect `Web Map Rendering` to `Database and Route Seeding`, `Animal Details and Audio`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `poi.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10676532769556026 - nodes in this community are weakly interconnected._