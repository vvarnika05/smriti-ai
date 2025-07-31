# 📁 Smriti AI – Project Structure & How It Works

Smriti AI is an all-in-one intelligent learning assistant that helps users organize, process, and revise learning resources using AI, quizzes, and reminders. Below is a detailed breakdown of the project's file structure and how each part contributes to the overall system.

---

## 1. **Top-Level Structure**

```
smriti-ai/
│
├── app/                # Main Next.js application (pages, API routes, layouts)
├── components/         # Reusable React components (UI, dashboard, landing, etc.)
├── hooks/              # Custom React hooks for data fetching and logic
├── lib/                # Server-side utilities (AI, cloud, DB, etc.)
├── prisma/             # Database schema and migrations (Prisma ORM)
├── public/             # Static assets (images, icons, etc.)
├── types/              # TypeScript type definitions
├── utils/              # Client-side utility functions
├── README.md           # Project overview and instructions
├── learn.md            # (You are here) In-depth file structure and architecture
├── ...other config files (Docker, ESLint, etc.)
```

---

## 2. **Key Folders Explained**

### **/app/**
- **Purpose:** Houses all Next.js pages, layouts, and API routes.
- **Structure:**
  - **(authenticated_Pages)/dashboard/**: Main dashboard for logged-in users, with subfolders for topics, resources, and quizzes.
    - **topic/[[...id]]/page.tsx**: Dynamic topic detail pages.
    - **resource/[[...id]]/page.tsx**: Dynamic resource detail pages.
    - **quiz/[[...id]]/page.tsx**: Dynamic quiz detail pages.
  - **api/**: Serverless API endpoints for user creation, reminders, resource processing (including AI), and topics.
  - **sign-in/**, **sign-up/**: Auth pages.
  - **layout.tsx, page.tsx**: Root layouts and landing page.

### **/components/**
- **Purpose:** All reusable UI and logic components.
- **Structure:**
  - **landing/**: Hero, About, Features, Pricing for the landing page.
  - **dashboard/**: Charts, tables, and dashboard-specific UI.
  - **topic/**, **quiz/**: Cards, modals, dialogs for topics and quizzes.
  - **ui/**: Generic UI elements (buttons, dialogs, tables, etc.).
  - **magicui/**: Special effects (animations, confetti, etc.).
  - **mermaid/**: Diagram rendering.
  - **navbar.tsx**: Main navigation bar.
  - **AuthGate.tsx**: Handles authentication gating for protected pages.

### **/hooks/**
- **Purpose:** Custom React hooks for encapsulating logic and data fetching.
- **Examples:**
  - **useResources.ts**: Fetch and manage learning resources.
  - **useTopic.ts**: Fetch and manage topics.

### **/lib/**
- **Purpose:** Server-side utilities and integrations.
- **Examples:**
  - **prisma.ts**: Prisma client for DB access.
  - **cloudinary.ts**: Image upload/management.
  - **twilio.ts**: WhatsApp reminder integration.
  - **prepareMermaidCode.ts**: Prepares code for diagram rendering.
  - **prompts.ts**: AI prompt templates.

### **/prisma/**
- **Purpose:** Database schema and migrations.
- **Files:**
  - **schema.prisma**: Defines all DB models (User, Topic, Resource, Quiz, etc.).
  - **migrations/**: SQL migration files for schema changes.

### **/types/**
- **Purpose:** TypeScript type definitions for shared data structures.

### **/utils/**
- **Purpose:** Client-side utility functions (e.g., YouTube helpers).

### **/public/**
- **Purpose:** Static assets (images, icons, etc.) served directly.

---

## 3. **How Everything Works Together**

### **User Flow**
1. **Landing & Auth:** Users land on the homepage (`app/page.tsx`), sign up or sign in (Clerk authentication).
2. **Dashboard:** Authenticated users access the dashboard to manage topics, resources, and quizzes.
3. **Resource Management:** Users add resources (YouTube, PDFs, links) to topics. Resources are processed by AI (summaries, mind maps, quizzes).
4. **Revision & Reminders:** Users receive WhatsApp reminders (via Twilio) for spaced repetition and can take quizzes to reinforce learning.
5. **Progress Tracking:** Users view performance charts and analytics on their dashboard.

### **Backend & API**
- **API Routes (`app/api/`)**: Handle user creation, resource ingestion (including AI processing), reminders, and topic management.
- **Database (Prisma + PostgreSQL):** Stores users, topics, resources, quizzes, and results.
- **AI Layer:** Uses LLMs (e.g., Gemini) to generate summaries, mind maps, and quizzes from user resources.

### **Frontend**
- **Next.js + React:** Renders all pages and components.
- **Tailwind CSS:** For styling.
- **Reusable Components:** Modular UI for rapid development and consistency.

### **Integrations**
- **Clerk:** User authentication.
- **Twilio:** WhatsApp reminders.
- **Cloudinary:** Media uploads.
- **Mermaid:** Diagram rendering.

---

## 4. **Extensibility & Future Scope**

- **Mobile App:** Planned for iOS & Android.
- **Chat-based Assistant:** Ask questions about saved content.
- **Institute Portal:** For educational organizations.

---

## 5. **Contributing**

- The project is open source and welcomes contributions! See `README.md` for setup instructions.

---

**Smriti AI** is designed to be modular, extensible, and easy to contribute to. Each folder and file has a clear responsibility, making it easy for new contributors to get started.
