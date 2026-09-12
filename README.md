---
config:
  layout: fixed
---
flowchart TB
    ROOT["📁 src"] --> ASSETS["assets"] & COMPONENTS["components"] & CONFIG["config"] & CONTEXT["context"] & DATA["data"] & HOOKS["hooks"] & LAYOUTS["layouts"] & PAGES["pages"] & ROUTES["routes"] & SERVICES["services"] & STYLES["styles"] & TYPES["types"] & UTILS["utils"]
    COMPONENTS --> COMMON["common"] & LAYOUT["layout"] & AUDIO["audio"] & MAP["map"]
    PAGES --> TOURIST["tourist"] & OWNER["owner"] & ADMIN["admin"] & AUTH["auth"] & TOURIST_PAGE["HomePage\nPoiDetailPage\nOfflinePage"] & OWNER_PAGE["OwnerPortal\nVerificationPendingPage"] & ADMIN_PAGE["DashboardPage\nPoiApprovalPage"] & AUTH_PAGE["LoginPage\nUnauthorizedPage"]
    SERVICES --> API["api"] & DB["db"] & LOCATION["location"] & AUDIO_S["audio"] & OFFLINE["offline"]
    ROUTES --> APP["AppRoutes"] & PROTECTED["ProtectedRoute"]
    CONTEXT --> AUTH_C["AuthContext"] & LANG["LanguageContext"] & OFFLINE_C["OfflineContext"]
    HOOKS --> GEO["useGeolocation"] & GEOFENCE["useGeofence"] & AUDIO_H["useAudioPlayer"] & OFFLINE_H["useOfflinePack"]
