<div align="center">

# HackX 1.0 — Student Developer Hackathon & Community Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20SSR-ff4154?logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker Mesh](https://img.shields.io/badge/Docker-Mesh%20%2B%20Caddy%20WAF-2496ed?logo=docker&logoColor=white)](https://caddyserver.com/)

**The official full-stack platform for HackX 1.0 — a premier 12-hour student hackathon held in Coimbatore, Tamil Nadu on December 28, 2026.**

[🌐 Live Website (hackx.club)](https://hackx.club) • [🚀 Register for HackX 1.0](https://hackx.club/register) • [💬 Contact Club](https://hackx.club/contact)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Event Highlights (HackX 1.0)](#-event-highlights-hackx-10)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features](#-key-features)
- [Security & Firewalls](#-security--firewalls)
- [Automated Email Notification System](#-automated-email-notification-system)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
  - [Deploy with Docker Compose (VPS)](#option-a-docker-compose--caddy-recommended-for-vps)
  - [Deploy to Vercel](#option-b-vercel-serverless)
- [SEO & Schema.org JSON-LD](#-seo--schemaorg-json-ld)
- [License](#-license)

---

## 🎯 Overview

**HackX** is a student-led developer organization and builder community built to bridge the gap between creative campus ideas and real-world technology startups. 

This repository contains the complete production-grade source code for **[hackx.club](https://hackx.club)**, engineered with **TanStack Start (SSR)**, **React 19**, **Drizzle ORM**, **PostgreSQL**, **Supabase fallback**, **Caddy Reverse Proxy with WAF**, and automated transactional emails.

---

## ⚡ Event Highlights (HackX 1.0)

| Attribute | Details |
| :--- | :--- |
| **Date** | December 28, 2026 |
| **Format** | 12-Hour Rapid Product Sprint |
| **Prize Pool** | ₹20,000+ in cash prizes, sponsor bounties, and cloud credits |
| **Food & Refreshments** | Fully provided for all participants |
| **Location** | Coimbatore, Tamil Nadu, India *(Venue to be announced)* |
| **Team Size** | 1 to 4 Members |

### 🛠️ Hackathon Innovation Tracks
1. **AI & Automation:** Agentic workflows, autonomous systems, LLMs, computer vision, and cognitive automation.
2. **Industry & Supply Chain (Industry 5.0):** Smart logistics, human-machine collaboration, IoT, and supply resilience.
3. **Climate & Agritech:** Sustainable energy, precision agriculture, carbon tracking, and resource conservation.
4. **Open Innovation:** Moonshot projects, decentralized protocols, fintech, or novel consumer technology.

---

## 🏗️ Architecture & Tech Stack

```mermaid
flowchart TD
    Client["🌐 Web Browser / Mobile Visitor"] -->|HTTPS / HTTP/3| Caddy["🛡️ Caddy Reverse Proxy (Auto-SSL & WAF)"]
    Caddy -->|Internal Port 3000| App["⚡ TanStack Start / Nitro SSR Node Server"]
    
    subgraph Isolated Backend Mesh [Docker Layer Firewall]
        App -->|Direct SQL Connection (Port 5432)| Postgres[("🐘 PostgreSQL 16 (SSD Volume)")]
        App -.->|Dual-write / HTTPS Fallback| Supabase[("☁️ Supabase Cloud DB & Auth")]
        App -->|Authenticated SMTP :465| Gmail["✉️ Gmail SMTP (clubhackx@gmail.com)"]
    end
    
    Gmail -->|Confirmation Email| Participant["📬 Participant Inbox"]
```

### Technology Matrix
* **Frontend Framework:** React 19 + TanStack Start (Server-Side Rendering & Streaming RPCs).
* **Styling & Motion:** Tailwind CSS v4, Three.js 3D solid metallic canvas animation, accessible CSS sticky card stacking.
* **Database & ORM:** PostgreSQL 16 Alpine, Drizzle ORM, Drizzle Kit migrations, dual-mode fallback to Supabase.
* **Serverless / Runtime:** Nitro node-server with Vercel serverless adapter support.
* **Security & Ingress:** Caddy 2 Alpine with Web Application Firewall (WAF) and automated Let's Encrypt TLS.
* **Email Engine:** Nodemailer with secure SSL Gmail SMTP (`clubhackx@gmail.com`).
* **Validation & Testing:** Zod runtime validation, ESLint 9, TypeScript 5.8 (Strict mode), Vitest test suite.

---

## 🚀 Key Features

* **Server-Side Rendered (SSR):** Instant first contentful paint (FCP) and optimal SEO indexing with server-rendered routes and dynamic metadata.
* **Automated Confirmation Emails:** New participant registrations trigger instantaneous, branded HTML confirmation emails with event schedule and WhatsApp community invitations.
* **Dual-Mode Database Architecture:** Primary writes target a high-performance local PostgreSQL instance, with transparent dual-write or fallback to Supabase over HTTPS.
* **Protected `/admin` Dashboard:** Hidden portal with credential authentication, metric cards (total registrations, teams, contact inquiries), real-time CSV data exports, and search filtering.
* **Three.js Chrome 3D Artwork:** Lightweight interactive 3D metallic logo with fallback semantic styling and reduced-motion accessibility.
* **Accessible Component Architecture:** Fully WCAG 2.1 compliant with high-contrast text tokens, semantic landmarks, and keyboard navigability.

---

## 🛡️ Security & Firewalls

### 1. Application Firewall (WAF) in Caddy
* **Payload Size Limits:** Enforces a maximum request body of `10MB` to eliminate memory exhaustion and denial-of-service (DoS) attempts.
* **Exploit & Dotfile Filtering:** Rejects HTTP requests scanning for sensitive directories (`/.env`, `/.git`, `/.docker`, `docker-compose.yml`, `/wp-admin`, `/phpmyadmin`, `.php`, `.asp`).
* **Scanner Bot Blocker:** Automatically drops traffic from automated vulnerability tools (`sqlmap`, `nikto`, `wpscan`, `dirbuster`, `nmap`).
* **Hardened Security Headers:**
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 2. Docker Layer Network Firewall
* Segmented into two isolated Docker networks:
  * `frontend_net`: Interconnects `caddy` and `app`.
  * `backend_net` (`internal: true`): Restricts `postgres` database communication strictly to `app`. `caddy` cannot reach the database container.

---

## ✉️ Automated Email Notification System

Every completed registration triggers an automated, branded HTML confirmation email via SMTP.

### Email Configuration (`.env`)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="clubhackx@gmail.com"
SMTP_PASS="your-google-app-password"
EMAIL_FROM="HackX Club <clubhackx@gmail.com>"
```

---

## 📂 Project Structure

```text
hackxclub/
├── .github/workflows/       # CI/CD Workflows (Build, Lint, Typecheck, Test, Docker GHCR)
├── drizzle/                 # Database schema definitions and SQL migrations
├── public/                  # Static web assets, favicons, logos, sitemap
├── src/
│   ├── assets/              # Locally bundled, compressed portraits (WebP)
│   ├── components/          # Reusable UI cards, 3D Chrome canvas, navigation, footer
│   ├── config/              # Global site configuration, phone numbers, domain URLs
│   ├── content/             # Single source of truth for site copy, FAQ, mentors, tracks
│   ├── integrations/        # Supabase client and auth middleware
│   ├── lib/                 # SEO meta generator, Schema.org JSON-LD, email dispatch
│   ├── routes/              # TanStack Start file-based routing
│   │   ├── index.tsx        # Homepage (Hero, Story, Tracks, Numbers, Mentors)
│   │   ├── events.index.tsx # Event directory
│   │   ├── events.hackx-1-0.tsx # HackX 1.0 official event page
│   │   ├── register.tsx     # Registration portal with direct DB insert & email dispatch
│   │   ├── contact.tsx      # Contact submission form
│   │   ├── admin.tsx        # Hidden administrative portal & CSV export
│   │   └── about.tsx        # Club history, core team, and leadership
│   └── start.ts             # TanStack Start server configuration & error middleware
├── Caddyfile                # Production reverse proxy configuration with WAF rules
├── docker-compose.yml       # Production service mesh (Caddy + App + Postgres)
├── Dockerfile               # Multi-stage production container build
└── package.json             # Scripts and dependencies
```

---

## 💻 Getting Started

### Prerequisites
* **Node.js 22+** or **Bun**
* **Docker & Docker Compose** (for local PostgreSQL container)

### 1. Clone the Repository
```bash
git clone https://github.com/hackx-club/hackxclub.git
cd hackxclub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your database URL and SMTP credentials.

### 4. Start Local PostgreSQL Database
```bash
docker compose up -d postgres
```

### 5. Run Database Migrations
```bash
npm run db:push
```

### 6. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Quality Gates

Run the test suite and static analysis tools:

```bash
# Run unit & integration tests (Vitest)
npm test

# Run ESLint validation
npm run lint

# Run TypeScript type safety verification
npm run typecheck
```

---

## 🚢 Deployment

### Option A: Docker Compose + Caddy (Recommended for VPS)
1. Point your domain DNS records (`A` and `AAAA`) to your server IP.
2. Set `DOMAIN="hackx.club"` and `ACME_EMAIL="admin@hackx.club"` in `.env`.
3. Start the entire mesh:
   ```bash
   docker compose up -d --build
   ```
   Caddy will automatically request and provision SSL certificates with zero downtime.

### Option B: Vercel (Serverless)
1. Import repository into Vercel with **Framework: Other**, Build Command: `npm run build`.
2. Add your Environment Variables in Vercel Project Settings:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_PUBLISHABLE_KEY`
   * `VITE_SUPABASE_PROJECT_ID`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
3. Trigger deployment.

---

## 🔍 SEO & Schema.org JSON-LD

Every page automatically generates rich semantic metadata defined in `src/lib/seo.ts`:
* **Schema.org `Event` Markup:** Injects structured data for date, attendance mode, location, and prize pool for Google Event Search.
* **Schema.org `FAQPage` Markup:** Displays interactive collapsible FAQ cards directly in Google Search SERPs.
* **BreadcrumbList:** Provides structured navigational hierarchy for indexation.
* **Open Graph & Twitter Cards:** Previews rich cards on WhatsApp, LinkedIn, and Twitter/X.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <b>Built with ❤️ by HackX Club • Coimbatore, India</b><br>
  For sponsorships and collaborations: <a href="mailto:clubhackx@gmail.com">clubhackx@gmail.com</a>
</div>
