
# Automated Audio Guide System for Saigon Zoo and Botanical Gardens

## 1. Project Overview

The Automated Audio Guide System for Saigon Zoo and Botanical Gardens is a software engineering project designed to support visitors in exploring the zoo through an interactive map, multilingual points of interest (POIs), audio guides, navigation assistance, and downloadable offline content.

The system also provides an administrative dashboard for managing POI information, images, audio guides, and system analytics.

The project consists of a visitor application, an admin web application, a backend API, a PostgreSQL database, and an AI service for translation and text-to-speech generation.

## 2. Main Features

### 2.1. Visitor Features

- **Language Selection:** Support Vietnamese, English, and Chinese.
- **Interactive Map:** Browse POIs and filter or search for locations.
- **POI Information:** View descriptions, images, and other available details.
- **Audio Guides:** Listen to audio introductions in supported languages.
- **Route Navigation:** Find routes between locations in the zoo.
- **Offline Content:** Download and access available POI information, images, and audio guides without an Internet connection.

### 2.2. Admin Features

- **Admin Authentication:** Sign in and sign out of the administration system.
- **POI Management:** Create, update, and delete POIs.
- **Image Management:** Add and manage images associated with POIs.
- **Audio Management:** Upload, replace, and delete audio guides.
- **AI-Assisted Audio Generation:** Translate scripts and generate multilingual audio using an AI service.
- **System Analytics:** View audio listening statistics, active visitor sessions, popular POIs, language distribution, and offline package download counts.
- **Audio Usage Reset:** Reset audio usage records after confirmation.

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| Web Frontend | React, Vite, JavaScript |
| Visitor Mobile / Web Application | React Native, Expo, TypeScript |
| Backend API | Node.js, Express.js |
| Database | PostgreSQL |
| Media Storage | Supabase Storage |
| AI Translation Service | Python, Ollama |
| Text-to-Speech Service | AI Agent with configured speech provider |
| Authentication | JWT, bcryptjs |
| Offline Content | ZIP packages, client-side storage |
| Deployment Configuration | Vercel, Render, Neon PostgreSQL |

## 4. Project Structure

```text
CNPM/
|
|-- app/
|   |-- BE/
|   |   |-- controllers/       # Backend request handlers
|   |   |-- routes/            # API endpoints
|   |   |-- db/                # PostgreSQL schema and seed scripts
|   |   |-- server.js          # Express server entry point
|   |   `-- package.json
|   |
|   |-- FE/
|   |   |-- src/
|   |   |   |-- api/           # Backend API client
|   |   |   |-- components/
|   |   |   |   |-- admin/     # Admin login and dashboard
|   |   |   |   `-- map/       # Visitor map and navigation
|   |   |   |-- context/
|   |   |   `-- App.jsx
|   |   `-- package.json
|   |
|   `-- agent/
|       |-- translat_bot.py   # Translation and TTS API
|       |-- requirements.txt
|       `-- README.md
|
|-- mobile/
|   |-- FE/
|   |   |-- src/
|   |   |   |-- api/           # API and offline content access
|   |   |   |-- components/    # Visitor interface components
|   |   |   |-- context/
|   |   |   `-- I18N/          # Language resources
|   |   `-- package.json
|   `-- package.json
|
`-- README.md
```

## 5. System Architecture

The system follows a client-server architecture.

1. The Visitor Application communicates with the backend to retrieve POI information, audio guides, and navigation-related data.
2. The Admin Dashboard communicates with protected backend endpoints to manage POIs, media, and analytics.
3. The Backend API handles authentication, data access, audio metadata, offline package generation, and analytics.
4. PostgreSQL stores structured application data.
5. Supabase Storage stores POI images and audio files.
6. The AI Service provides translation and text-to-speech generation for administrative content creation.
7. Offline Content Storage allows visitors to access downloaded content locally.

## 6. Installation and Setup

### 6.1. Prerequisites

Before running the project, install:

- Node.js and npm
- PostgreSQL or access to an existing PostgreSQL database
- Python and pip (for the AI service)
- Expo Go or a compatible Expo development environment (for the mobile application)
- Ollama (if running the translation service locally)

### 6.2. Clone the Repository

```bash
git clone https://github.com/hieu110406/CNPM.git
cd CNPM
```

### 6.3. Backend Setup

Open a terminal in the backend directory:

```bash
cd app/BE
npm install
```

Create a `.env` file inside `app/BE` and configure the required environment variables.

Example using a PostgreSQL connection URL:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES=1h

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The backend also supports local PostgreSQL connection settings such as `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` when `DATABASE_URL` is not provided.

Start the backend:

```bash
npm run dev
```

The default backend URL is:

```text
http://localhost:5000
```

Health-check endpoint:

```text
GET http://localhost:5000/api/health
```

The backend initializes its database schema during startup.

Optional database seed commands:

```bash
npm run seed
npm run seed:pois
```

Run seed commands only when sample or initial data is required.

### 6.4. Web Frontend Setup

Open a new terminal:

```bash
cd app/FE
npm install
```

Create a `.env` file if custom service URLs are required:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TRANSLATION_API_URL=http://localhost:8000
```

Start the web frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

The web frontend includes the visitor map interface and admin login/dashboard.

### 6.5. Mobile Application Setup

Open a new terminal from the repository root:

```bash
cd mobile
npm install
npm --prefix FE install
```

Start the application:

```bash
npm start
```

The mobile launcher can also start or reuse the backend service.

Available commands:

```bash
npm run android
npm run ios
npm run web
```

For a physical device, configure the backend API URL in `mobile/FE/.env.local` when needed:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

Replace `YOUR_LOCAL_IP` with the local network address of the machine running the backend.

The phone and development machine must be able to communicate over the network.

### 6.6. AI Service Setup (Optional)

The AI service is required for translation and AI-generated audio features.

From the repository root:

```bash
python -m pip install -r app/agent/requirements.txt
```

For local translation with Ollama, install Ollama and download the configured model:

```bash
ollama pull llama3.2:3b
```

Create `app/agent/.env` based on `app/agent/.env.example`.

Example configuration:

```env
OLLAMA_MODEL=llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434
AGENT_ALLOWED_ORIGINS=http://localhost:5173

NINEROUTER_BASE_URL=your_speech_provider_endpoint
NINEROUTER_API_KEY=your_speech_provider_key
```

Start the AI service:

```bash
cd app/agent
uvicorn translat_bot:app --host 0.0.0.0 --port 8000
```

Available endpoints include:

```text
GET  /health
POST /translate-poi
POST /translate-script
POST /text-to-speech
```

Translation requires the configured Ollama service to be available. Text-to-speech generation requires a valid configured speech provider.

For more details, see `app/agent/README.md`.

## 7. Backend API Overview

The backend exposes the following main API groups:

| API Group | Purpose |
|---|---|
| `/api/auth` | Admin authentication |
| `/api/pois` | POI information and management |
| `/api/audio` | Audio guide information and management |
| `/api/analytics` | Usage statistics and visitor sessions |
| `/api/pathfinding` | Navigation and pathfinding |
| `/api/route` | Route requests |
| `/api/offline` | Offline package metadata and downloads |

Some endpoints require a valid Admin authentication token.

## 8. Database Overview

The PostgreSQL database contains the following main tables:

| Table | Description |
|---|---|
| `admin_account` | Admin account information |
| `category` | POI categories |
| `poi` | POI information and coordinates |
| `poi_translation` | Multilingual POI content |
| `poi_image` | POI image records |
| `audio_track` | Audio guide metadata |
| `audit_log` | Administrative audit records |
| `usage_log` | Audio listening activity |
| `online_session` | Active visitor sessions |
| `map_node` | Navigation graph nodes |
| `map_edge` | Navigation graph edges |
| `offline_package` | Offline package metadata |
| `package_download` | Offline package download records |

Database schema definitions are maintained in:

```text
app/BE/db/schema.sql
```

## 9. Offline Mode

The system supports downloadable offline content packages.

When the required package has been downloaded successfully, the visitor application can access available offline POI information, images, and audio guides.

Offline support depends on the content included in the downloaded package and the device's local storage.

The backend generates ZIP packages and records download requests for analytics purposes.

Download counts represent recorded download requests, not necessarily unique visitors.

## 10. Security

The system includes the following security measures:

- JWT-based Admin authentication.
- Password verification using bcryptjs.
- Protected administrative API endpoints.
- Temporary account locking after repeated failed login attempts.
- Audit logging for authentication-related activities.
- Environment variables for database credentials, authentication secrets, and external service keys.

Do not commit `.env` files containing real passwords, API keys, or service credentials.

Production services should use HTTPS for network communication.

## 11. Project Documentation

The project documentation includes a Product Requirements Document (PRD) describing:

- Functional Requirements
- Non-Functional Requirements
- Use Case Specifications
- Use Case and Activity Diagrams
- Component Diagram
- Deployment Diagram
- Entity Relationship Diagram (ERD)
- Data Flow Diagrams (DFD)

## 12. Notes

- Some functionality depends on external services, including PostgreSQL, Supabase Storage, and the AI service.
- AI translation and text-to-speech generation require their respective services to be configured and available.
- Offline content must be downloaded before it can be accessed without an Internet connection.
- The Admin Dashboard provides analytics viewing and audio usage reset; it does not currently provide an interface for managing Admin accounts.
- This repository contains multiple frontend implementations. Refer to their respective directories for environment-specific setup details.

## 13. Project Purpose

This project was developed as part of a Software Engineering course to demonstrate requirements analysis, system design, full-stack development, database integration, AI-assisted content generation, and offline-capable visitor applications.
