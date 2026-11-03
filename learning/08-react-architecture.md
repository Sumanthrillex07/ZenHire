# SDE-1 Engineering Masterclass — 08: React 18 & Frontend Architecture

> **Focus:** React 18 (Vite + TypeScript), State Architecture, Protected Route Guards, Axios Interceptors  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

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

## 2. Interview Preparation & React Flashcards

### Question 1: "What is the purpose of the `key` prop in React lists, and why shouldn't you use array index as key?"
**Answer:**  
The `key` prop gives elements a stable identity across renders, allowing React's reconciliation algorithm (Virtual DOM diffing) to determine which items have changed, been added, or been removed. Using an array index as the key leads to bugs and performance degradation if the list is sorted, filtered, or items are inserted/deleted, because the index of an item changes, causing React to misidentify component instances and preserve incorrect internal state. In ZenHire, we always use entity UUIDs (e.g., `job.id`, `question.id`).

### Question 2: "What is the difference between `useEffect` and `useCallback`?"
**Answer:**  
- `useEffect` is used to synchronize a component with external systems (performing side effects such as fetching data from an API, subscribing to browser events, or mutating the DOM) after the component renders.
- `useCallback` is a performance optimization hook used to memoize a function definition between renders, preventing child components that receive the function as a prop from re-rendering unnecessarily when the parent re-renders.

