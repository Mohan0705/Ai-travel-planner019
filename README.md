# Voyage AI - Intelligent Multi-Agent Travel Assistant

Voyage AI is a highly sophisticated, production-ready full-stack travel orchestration platform. It is engineered with a high-contrast luxury aesthetic and runs on a secure PostgreSQL-backed architecture with full Firebase multi-user session isolation.

## 🌟 Core Highlights

- **Bespoke Multi-Agent Planner**: Leverages Gemini 3.5 Flash via structured JSON schemas to construct complete hour-by-hour travel itineraries, high-fidelity local culinary suggestions, and custom hotel recommendations.
- **Relational Cloud SQL Engine**: Backed by PostgreSQL utilizing the modern, type-safe Drizzle ORM to capture and synchronize trip itineraries, active alert channels, multi-user transactions, and admin system logs.
- **Secure Multi-User Isolation**: Built on Firebase Authentication (Email/Password & Google OAuth) with server-side identity verification via JWT ID tokens inside the Express API middleware.
- **Hybrid Local Cache Resilience**: Features zero-config guest fallback to client-side storage, ensuring immediate responsiveness and offline travel access even without user authentication.
- **Audit Logging & Telemetry**: Dynamic administrative deck displaying database sizing, query latency statistics, and audit logs tracking travel creations, duplications, and deletions.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 with bespoke natural hues
- **Icons**: Lucide React
- **Animations**: Framer Motion / Motion

### Backend Server
- **Framework**: Express.js REST API Layer
- **Language**: TypeScript (compiled to CommonJS for optimized Node cold starts)
- **Execution**: `tsx` (Development) / Bundled `esbuild` target (Production)

### Databases & Infrastructure
- **Primary Database**: Google Cloud SQL (PostgreSQL instance with connection pooling)
- **Object-Relational Mapping (ORM)**: Drizzle ORM (schema definitions) & Drizzle Kit (migrations)
- **Session Auth**: Firebase client-side SDK & `firebase-admin` server-side token decoder

---

## 🗺️ Database Schema Representation

The application's relational data model is cleanly declared in `/src/db/schema.ts`:

- **`users`**: Manages unique voyager accounts synced via Firebase `uid`.
- **`trips`**: Stores destination names, custom traveler criteria, and full JSON-structured itinerary steps.
- **`expenses`**: Tracks ledger transactions with title, category, price, and foreign key relations to specific trips.
- **`notifications`**: Distributes real-time alerts, safety announcements, and itinerary completion notifications.
- **`adminLogs`**: Records system telemetry actions, log audits, and platform events.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory.

```env
# Google Gemini API key for smart travel generation
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# App public host URL
APP_URL="https://voyageur.onrender.com"

# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database"
```

*Note: For server-side Firebase verification, ensure the `firebase-blueprint.json` or configuration credentials are properly placed inside the working workspace.*

---

## 🚀 Local Run Guide

### 1. Install Workspace Dependencies
```bash
npm install
```

### 2. Run Database Migrations
Deploy the database schemas instantly using Drizzle:
```bash
npx drizzle-kit push
```

### 3. Launch Development Server
Starts the Express full-stack proxy on port 3000 with hot asset reloading:
```bash
npm run dev
```

---

## 🌐 Production & Render Deployment

This workspace is fully prepared for instantaneous zero-error deployment to Cloud Run, Render, or Heroku.

### Build Step
When deploying, configure your build command as:
```bash
npm run build
```
This script compiles the static frontend, bundles the Express server using `esbuild` inside the `dist/` workspace, and prepares the Node.js production container.

### Start Step
Set the web start script to:
```bash
npm run start
```
This runs the lightweight, self-contained `node dist/server.cjs` entry point binding to host `0.0.0.0` on port `3000`.

---

## 🛡️ License

Crafted with premium code quality, visual minimalism, and exceptional structural precision.
All rights reserved © 2026 Voyageur Inc.
