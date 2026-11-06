# 08: React 18 & Frontend Architecture

> **Focus:** React 18 (Vite + TypeScript), State Architecture, Protected Route Guards, Axios Interceptors  
> **Context:** ZenHire Talent Intelligence Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 8.1: Global Auth State via React Context vs Local State

#### 1. What is it?
React Context provides a way to pass data through the component tree without having to pass props down manually at every level ("prop drilling"). In ZenHire, `AuthContext` provides the authenticated user identity, JWT token, and login/logout handlers to any component in the application.

#### 2. Why are we using it in ZenHire?
Components across the tree (Navbar, ProtectedRoute guards, Candidate Dashboard, Job Application buttons) need to know:
- Is the user currently authenticated?
- What is their role (`ROLE_CANDIDATE` vs `ROLE_RECRUITER`)?
- What is their associated profile ID (`candidateId` or `recruiterId`)?

#### 3. How does it work internally?
1. `AuthProvider` wraps the root application (`App.tsx`).
2. It initializes state from `localStorage.getItem('zenhire_token')` and `localStorage.getItem('zenhire_user')`.
3. It exposes a custom hook `useAuth()`:
```tsx
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
```
4. For all non-auth state (e.g. current question index in `TestRunner`, applicant filter query in `ApplicantList`), we use **component-local state (`useState`)**, avoiding unnecessary global state overhead.

#### 4. Where is it implemented in ZenHire?
In `frontend/src/context/AuthContext.tsx` and consumed across `frontend/src/pages/*`.

#### 5. What problem does it solve?
Prevents prop-drilling through intermediate presentation components, and centralizes authentication token persistence in one place.

#### 6. What are the alternatives?
- **Redux Toolkit / Zustand:** Excellent for applications with high-frequency shared state (e.g., shopping carts, complex multi-user canvas editors). For ZenHire's scope, Redux introduces unnecessary boilerplate.

#### 7. What are the trade-offs?
- When Context value changes, every consumer component re-renders.
- **Mitigation:** `AuthContext` changes only during login and logout, so re-render cost is virtually zero during active user sessions.

#### 8. What questions could an interviewer ask about it?
> *"When should you choose React Context over an external state management library like Redux or Zustand?"*  
> **Strong Answer:** "React Context is ideal for low-frequency global state that needs to be accessed by many components across the tree—such as authentication status, current theme (dark/light), or user language locale. For high-frequency state updates or complex derived state where granular component re-render optimization is required, external stores like Zustand or Redux Toolkit are preferable because they allow components to subscribe to specific slices of state."

---

### Concept 8.2: Route Guards (`ProtectedRoute`) & Axios Interceptors

#### 1. What is it?
`ProtectedRoute` is a higher-order wrapper component that inspects the current user session and prevents unauthorized navigation to role-restricted routes. Axios Interceptors are middleware functions that intercept outgoing requests and incoming responses globally.

#### 2. Why are we using it in ZenHire?
1. If a candidate attempts to visit `/recruiter/dashboard`, `ProtectedRoute` intercepts the route and redirects them to `/candidate/dashboard`.
2. Every API request to Spring Boot needs `Authorization: Bearer <token>`. Manually adding headers to every Axios call is error-prone. An Axios request interceptor injects the token automatically.
3. If an API request returns HTTP 401 (token expired), an Axios response interceptor catches it, clears local storage, and redirects the user to `/login`.

#### 3. How does it work internally?
```mermaid
flowchart TD
    AxiosCall[Axios API Call: axios.get('/api/v1/jobs')] --> ReqInterceptor[Request Interceptor]
    ReqInterceptor --> TokenCheck{Token in localStorage?}
    TokenCheck -->|Yes| InjectHeader[Inject Authorization: Bearer token]
    TokenCheck -->|No| ForwardNoHeader[Forward Request unmodified]
    InjectHeader --> Dispatch[Dispatch over HTTP to Spring Boot]
    ForwardNoHeader --> Dispatch
    Dispatch --> RespInterceptor[Response Interceptor]
    RespInterceptor --> StatusCheck{HTTP Status == 401?}
    StatusCheck -->|Yes| ClearSession[Clear localStorage & Redirect to /login]
    StatusCheck -->|No| ReturnData[Return response.data to caller]
```

#### 4. Where is it implemented in ZenHire?
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/api/axiosClient.ts`

```tsx
// ProtectedRoute.tsx
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ROLE_RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
  }

  return <>{children}</>;
};
```

#### 5. What problem does it solve?
Guarantees consistent edge security on the client, prevents unauthorized URL access, and eliminates token injection boilerplate across dozens of API services.

#### 6. What are the alternatives?
Manual checks inside every page component `useEffect()`. Highly fragile and causes page content to flicker before redirecting.

#### 7. What are the trade-offs?
Client-side route protection is purely for UX and navigation convenience. True security is enforced on the Spring Boot backend (`@PreAuthorize`). Even if an attacker bypasses React route guards, the backend rejects unauthorized API calls with 403 Forbidden.

#### 8. What questions could an interviewer ask about it?
> *"Is client-side route protection with React Router sufficient to secure an application?"*  
> **Strong Answer:** "No, client-side route protection is purely a user experience convenience to guide the user to the proper screens. Because all client-side code runs in the user's browser, an attacker can modify JavaScript in DevTools to bypass route guards. True security must always be enforced on the backend via Spring Security filters and method-level authorization checks."

---

### Concept 8.3: Dynamic Mouse-Tracking Spotlight via CSS Custom Properties & `requestAnimationFrame`

#### 1. What is it?
A high-performance pattern for interactive UI lighting effects where mouse pointer coordinates are captured globally and injected directly into target DOM elements via CSS Custom Properties (`--mouse-x`, `--mouse-y`) without triggering React Virtual DOM reconciliation or component re-renders.

#### 2. Why are we using it in ZenHire?
The NestJS design system (`DESIGN.md`) specifies that cards and panels must feel alive with a furnace spotlight: when hovering over a card, a crimson-to-garnet radial spotlight and a 1px border glow track the cursor. If this coordinate tracking were stored in React state (`useState`), every single pixel of mouse movement would trigger 60–140 React re-renders per second across the dashboard, causing severe frame drops, input lag, and garbage collection churn.

#### 3. How does it work internally?
1. In `App.tsx`, a single passive `pointermove` listener is registered on `document`.
2. When the cursor enters any element matching `.glass-card` (or its ancestors), the handler calculates mouse offsets relative to the card's bounding rectangle (`e.clientX - rect.left`, `e.clientY - rect.top`).
3. Coordinates are queued and dispatched through `window.requestAnimationFrame()`, syncing updates strictly to the browser's display refresh rate (V-Sync).
4. Instead of calling a React state setter, the handler directly calls:
   ```ts
   card.style.setProperty('--mouse-x', x.toFixed(1));
   card.style.setProperty('--mouse-y', y.toFixed(1));
   ```
5. In `index.css`, pseudo-elements `::before` and `::after` consume these variables:
   ```css
   .glass-card::before {
     background: radial-gradient(
       350px circle at calc(var(--mouse-x, 0) * 1px) calc(var(--mouse-y, 0) * 1px),
       rgba(234, 40, 69, 0.12),
       transparent 70%
     );
   }
   ```
6. The CSS engine delegates gradient rendering directly to the GPU on the compositor thread with zero JavaScript execution overhead per frame.

#### 4. Where is it implemented in ZenHire?
- Global coordinate engine: `frontend/src/App.tsx` (`useEffect` hook setting up `requestAnimationFrame` listener).
- CSS pseudo-element styling: `frontend/src/index.css` (`.glass-card::before` and `.glass-card::after`).
- Target cards: `CandidateDashboard.tsx`, `RecruiterDashboard.tsx`, `JobBrowsePage.tsx`, etc.

#### 5. What problem does it solve?
Eliminates 100% of React component re-rendering overhead during mouse movement while delivering 60+ FPS fluid micro-interactions and GPU-accelerated gradient positioning.

#### 6. What are the alternatives?
- **React State Hook (`useState` with `onMouseMove` on every card):** Causes 60+ re-renders/sec per card, causing high CPU usage and laggy interactions.
- **Canvas / WebGL overlay:** Powerful but adds excessive complexity, DOM layer detachment, and accessibility barriers.
- **Static hover effects:** Simple, but lacks the tactile, high-precision aesthetic mandated by `DESIGN.md`.

#### 7. What are the trade-offs?
- Bypasses React's unidirectional data flow by mutating inline styles directly on the DOM element.
- **Mitigation:** Scoped strictly to visual presentation tokens (`--mouse-x`, `--mouse-y`); zero business state or layout properties are touched.

#### 8. What questions could an interviewer ask about it?
> *"How do you implement complex 60fps cursor-following animations in React without causing performance bottlenecks?"*  
> **Strong Answer:** "By decoupling cursor tracking from React's state lifecycle. Storing pointer coordinates in `useState` forces the entire component tree to re-render on every frame. Instead, we use a single passive global event listener batched via `requestAnimationFrame` that mutates CSS custom properties (`--mouse-x`, `--mouse-y`) directly on the target element's style object. The browser’s GPU compositor calculates the radial gradient position entirely on the compositor thread without touching the JavaScript main thread or triggering React diffing."

---

### Concept 8.4: Multi-Section Resume Profile Synchronization & State Coordination in React Dashboards

#### 1. What is it?
An asynchronous data coordination pattern where dashboard views synthesize multiple independent API endpoints (e.g., candidate dashboard metrics, 5-section resume profiles, and live application pipeline records) using `Promise.allSettled`, providing graceful partial degradation and real-time visualization of profile completeness.

#### 2. Why are we using it in ZenHire?
A candidate's dashboard must present their unified hiring readiness:
- 5-Section Resume Synchronization status (`SKILLS`, `EXPERIENCE`, `PROJECTS`, `EDUCATION`, `CERTIFICATIONS`).
- Extracted Skill Taxonomy chips with confidence percentages (including novel AI frameworks like `LangChain` and `LangGraph`).
- Real-time active application counts that reflect pipeline statuses (`APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`).
If a single call fails (e.g., if a candidate has not yet uploaded a resume, causing `/api/resumes/latest` to return 404 or empty data), the dashboard must not crash or fail to render the candidate's active job applications or assessments.

#### 3. How does it work internally?
```tsx
const [dashboard, setDashboard] = useState<CandidateDashboardData | null>(null);
const [resume, setResume] = useState<ResumeData | null>(null);
const [applications, setApplications] = useState<ApplicationItem[]>([]);

useEffect(() => {
  const fetchDashboardData = async () => {
    const [dashRes, resumeRes, appsRes] = await Promise.allSettled([
      candidateApi.getDashboard(),
      resumeApi.getLatestResume(),
      applicationApi.getMyApplications()
    ]);

    if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data);
    if (resumeRes.status === 'fulfilled') setResume(resumeRes.value.data);
    if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
  };
  fetchDashboardData();
}, []);
```
- In the UI, the 5 sections are visualized as synchronized pills with semantic check icons (`CheckCircle2`).
- The skills list extracts verified skill chips with confidence badges (`Math.round(skill.confidence * 100)%`), linking to `/candidate/resume` for the full dossier.
- Active applications are computed dynamically (`applications.filter(a => ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length`), ensuring the KPI metric precisely matches the pipeline details view.

#### 4. Where is it implemented in ZenHire?
- `frontend/src/pages/candidate/CandidateDashboard.tsx`
- `frontend/src/api/candidateApi.ts`, `frontend/src/api/resumeApi.ts`, `frontend/src/api/applicationApi.ts`

#### 5. What problem does it solve?
Prevents "all-or-nothing" page loading failures, guarantees accurate cross-component state synchronization, and provides candidates with immediate visual feedback on their profile verification status.

#### 6. What are the alternatives?
- **`Promise.all`:** Fails completely if any individual promise rejects (e.g., a 404 on `latestResume` would crash the entire dashboard).
- **Sequential `await` calls:** Introduces waterfall latency (dash -> resume -> apps = 3x network roundtrips).
- **Global Redux store:** Unnecessary boilerplate for page-specific data fetching.

#### 7. What are the trade-offs?
- Requires handling partial state combinations in component rendering (e.g., dashboard loaded but resume is null).
- **Mitigation:** Safe optional chaining (`resume?.skills?.length`) and structured fallback UI states (e.g., "Upload PDF to trigger 5-section AI sync").

#### 8. What questions could an interviewer ask about it?
> *"Why should you prefer `Promise.allSettled` over `Promise.all` when aggregating data on a complex dashboard?"*  
> **Strong Answer:** "`Promise.all` has fail-fast semantics: if any single request rejects, the entire aggregate promise immediately rejects and drops the results of all other requests. In a complex dashboard combining user metrics, recent resumes, and active applications, non-critical sub-resources (like a candidate not having uploaded a resume yet) should never prevent the core dashboard from rendering. `Promise.allSettled` executes all requests concurrently and returns an array of outcome objects with status 'fulfilled' or 'rejected', allowing each widget to render gracefully or display a contextual empty state."

---

## 2. Key Frontend Architecture Questions & Answers

### Question 1: "What is the purpose of the `key` prop in React lists, and why shouldn't you use array index as key?"
**Answer:**  
The `key` prop gives elements a stable identity across renders, allowing React's reconciliation algorithm (Virtual DOM diffing) to determine which items have changed, been added, or been removed. Using an array index as the key leads to bugs and performance degradation if the list is sorted, filtered, or items are inserted/deleted, because the index of an item changes, causing React to misidentify component instances and preserve incorrect internal state. In ZenHire, we always use entity UUIDs (e.g., `job.id`, `question.id`).

### Question 2: "What is the difference between `useEffect` and `useCallback`?"
**Answer:**  
- `useEffect` is used to synchronize a component with external systems (performing side effects such as fetching data from an API, subscribing to browser events, or mutating the DOM) after the component renders.
- `useCallback` is a performance optimization hook used to memoize a function definition between renders, preventing child components that receive the function as a prop from re-rendering unnecessarily when the parent re-renders.

