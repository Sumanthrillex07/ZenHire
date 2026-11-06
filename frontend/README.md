# ZenHire — Frontend Application

The frontend of **ZenHire** is a responsive Single Page Application (SPA) built with **React 18**, **TypeScript**, and **Vite**, styled with a custom **Tailwind CSS** implementation of the **NestJS Design System** (`DESIGN.md`).

---

## 1. Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Typography:** Manrope (Display & Interface, 500/700 weight) + Geist Mono (Paragraphs, Metadata, Eyebrows, 300/400 weight)
- **Styling:** Tailwind CSS 3 with NestJS semantic CSS custom properties
- **HTTP Client:** Axios with JWT interceptors
- **Icons:** Lucide React
- **Testing:** Vitest & React Testing Library (9 passing test suites)

---

## 2. Key Features & Design System

- **NestJS Dual-Theming Parity:**
  - **Dark Mode:** Soot Canvas (`#050303`), Carbon Panels (`#0b0b0b`), Ash Seams (`#1e1c1c`), Smoke Outlines (`#373535`), Pewter Text (`#9b9a9a`), and Bone White text (`#ffffff`).
  - **Light Mode:** Warm Linen Canvas (`#faf8f8`), Warm White surfaces (`#ffffff`), Warm Alabaster (`#f2eeee`), and deep carbon ink typography (`#0c0909`).
- **Interactive Mouse-Tracking Spotlight:**
  - Cards decorated with `.glass-card` receive an interactive spotlight that dynamically tracks the cursor via a global `requestAnimationFrame` pointer listener in `App.tsx`, projecting a soft Nest Crimson (`#ea2845`) radial wash and 1px hairline border glow.
- **Top-Lit Furnace Glow:** Hero frames feature subtle crimson-to-garnet sweeps (`#ea2845` ➔ `#780f20` ➔ `#050303`), giving surfaces an illuminated depth.
- **5-Section Resume Intelligence Panel:**
  - Real-time synchronization badges across the 5 canonical sections: **Skills**, **Experience**, **Projects**, **Education**, and **Certifications**.
  - Verified skill taxonomy chips with confidence scores (e.g. `LangChain 95%`, `LangGraph 92%`, `Spring Boot 95%`) and preserved unmapped frameworks.
- **Real-Time Pipeline Synchronization:**
  - Candidate dashboard displays live active pipeline metrics linking directly to `/candidate/applications`.
  - In job discovery (`/jobs`), jobs the candidate has already applied for display a disabled "Applied" badge and are automatically sorted to the bottom so fresh opportunities take precedence.
- **Zero Mock Data:** 100% of candidate, job, resume, assessment, and recruiter workflows connect directly to the Spring Boot REST API.

---

## 3. Directory Layout

```
src/
├── api/                  # Typed Axios API client modules
│   ├── apiClient.ts      # Base Axios instance with token interceptor
│   ├── authApi.ts        # Login & registration endpoints
│   ├── jobApi.ts         # Job browsing & requisition authoring
│   ├── resumeApi.ts      # PDF upload & parsed profile retrieval
│   ├── assessmentApi.ts  # Test catalogs, questions, attempt grading
│   ├── applicationApi.ts # Application submissions & status updates
│   ├── matchingApi.ts    # 60/40 Hybrid match evaluations
│   ├── recruiterApi.ts   # Recruiter dashboard metrics
│   └── chatApi.ts        # AI Career Advisor chat
├── components/           # Reusable UI components
│   ├── ui/               # Core primitives: Button, Input, Card, Skeleton, ThemeToggle
│   ├── Badge.tsx         # CategoryBadge, MatchScoreBadge, ApplicationStatusBadge
│   ├── ChatWidget.tsx    # Contextual floating AI assistant widget
│   ├── Footer.tsx        # Responsive platform footer with NestJS styling
│   ├── LoadingSpinner.tsx# Theme-aware loading spinner
│   ├── Modal.tsx         # Slide-up accessible dialog modal
│   └── Navbar.tsx        # Floating glassmorphic header with mobile drawer
├── context/              # Global React Contexts
│   ├── AuthContext.tsx   # User authentication, roles, session persistence
│   └── ThemeContext.tsx  # Light/Dark theme engine & transition coordinator
├── pages/                # Route views
│   ├── LandingPage.tsx   # Product landing page with furnace hero and metrics
│   ├── auth/             # LoginPage, RegisterPage
│   ├── candidate/        # Dashboard, JobBrowse, JobDetail, ResumeUpload, Assessments, Applications
│   └── recruiter/        # Dashboard, PostJob, ApplicantList
├── types/                # TypeScript interfaces and API contract models
├── App.tsx               # Route definitions, Providers, and RAF mouse spotlight listener
├── index.css             # NestJS CSS custom properties, glassmorphism, mouse spotlight
└── main.tsx              # Application entry point
```

---

## 4. Available Scripts

In the `frontend` directory:

```bash
# Start local development server (http://localhost:5173)
npm run dev

# Run unit and component tests with Vitest
npm test -- --run

# Run TypeScript check and production build
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Application Routes

| Path | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Platform landing page with NestJS furnace hero |
| `/login` | Public | Authentication with demo credential shortcuts |
| `/register` | Public | Role-based registration (Candidate / Recruiter) |
| `/jobs` | Public / Authenticated | Job discovery and search catalog (applied jobs sink, button disabled) |
| `/jobs/:id` | Public / Authenticated | Job specification & 60/40 AI compatibility evaluation |
| `/candidate/dashboard` | Candidate | 5-Section Resume Intelligence, Active Pipeline KPI, Skill Diagnostics |
| `/candidate/resume` | Candidate | Drag-and-drop PDF upload, section synchronization & verified skill taxonomy |
| `/candidate/assessments` | Candidate | Technical verification catalog |
| `/candidate/assessments/:testId` | Candidate | Multiple-choice assessment runner |
| `/candidate/applications` | Candidate | Application status pipeline & interview schedule tracker |
| `/recruiter/dashboard` | Recruiter | Recruitment command center, KPIs, top candidates |
| `/recruiter/jobs/new` | Recruiter | Job requisition authoring with skill chips |
| `/recruiter/jobs/:jobId/applicants` | Recruiter | Ranked candidate pipeline with interview scheduler |
