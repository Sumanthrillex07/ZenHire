# ZenHire — Frontend Application

The frontend of **ZenHire** is a responsive Single Page Application (SPA) built with **React 18**, **TypeScript**, and **Vite**, styled with a custom **Tailwind CSS** design system.

---

## 1. Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Styling:** Tailwind CSS 3 with semantic CSS custom properties
- **HTTP Client:** Axios with JWT interceptors
- **Icons:** Lucide React
- **Testing:** Vitest & React Testing Library

---

## 2. Key Features & Design System

- **First-Class Dual Theming:** Full parity between Light Mode (`#f8fafc` canvas, emerald `#059669` primary) and Dark Mode (`#050811` canvas, emerald `#10b981` primary) with zero-FOUT inline pre-rendering.
- **Smooth 250ms Delayed Transition:** A temporary transition layer interpolates all surface colors, border colors, and word typography colors with a 250ms transition delay on theme toggle.
- **Headless UI Primitives (`src/components/ui/`):** Standardized `<Button>`, `<Input>`, `<Card>`, `<Skeleton>`, `<Modal>`, and `<Badge>` components.
- **Mobile-First Responsiveness:** Complete support from small viewports (320px–375px) up to ultrawide desktop monitors (1920px), featuring a dedicated mobile navigation drawer.
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
│   ├── Footer.tsx        # Responsive platform footer
│   ├── LoadingSpinner.tsx# Theme-aware loading spinner
│   ├── Modal.tsx         # Slide-up accessible dialog modal
│   └── Navbar.tsx        # Glassmorphic header with mobile drawer
├── context/              # Global React Contexts
│   ├── AuthContext.tsx   # User authentication, roles, session persistence
│   └── ThemeContext.tsx  # Light/Dark/System theme engine & transition coordinator
├── pages/                # Route views
│   ├── LandingPage.tsx   # Product landing page with metrics and comparison
│   ├── auth/             # LoginPage, RegisterPage
│   ├── candidate/        # Dashboard, JobBrowse, JobDetail, ResumeUpload, Assessments, Applications
│   └── recruiter/        # Dashboard, PostJob, ApplicantList
├── types/                # TypeScript interfaces and API contract models
├── App.tsx               # Route definitions and Providers
├── index.css             # Semantic HSL variables, glassmorphism, scrollbars
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
| `/` | Public | Platform landing page |
| `/login` | Public | Authentication with demo credential shortcuts |
| `/register` | Public | Role-based registration (Candidate / Recruiter) |
| `/jobs` | Public / Authenticated | Job discovery and search catalog |
| `/jobs/:id` | Public / Authenticated | Job specification & 60/40 AI compatibility evaluation |
| `/candidate/dashboard` | Candidate | Overview KPIs, domain readiness diagnostics, open requisitions |
| `/candidate/resume` | Candidate | Drag-and-drop PDF resume upload & profile sync |
| `/candidate/assessments` | Candidate | Technical verification catalog |
| `/candidate/assessments/:testId` | Candidate | Multiple-choice assessment runner |
| `/candidate/applications` | Candidate | Application status pipeline & interview schedule tracker |
| `/recruiter/dashboard` | Recruiter | Recruitment command center, KPIs, top candidates |
| `/recruiter/jobs/new` | Recruiter | Job requisition authoring with skill chips |
| `/recruiter/jobs/:jobId/applicants` | Recruiter | Ranked candidate pipeline with interview scheduler |

