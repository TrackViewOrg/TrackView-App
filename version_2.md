# TrackView Prod - Version 2.0 Restructuring Plan

## 1. Architecture & Performance Optimization

### Server-First Data Fetching
*   **Move data fetching to Server Components**: Minimize client-side waterfalls by fetching data in `page.tsx` or `layout.tsx` server components.
*   **Server Actions**: Replace API routes with Server Actions for mutations (POST/PUT/DELETE) to reduce bundle size and simplify type safety.
*   **Suspense & Streaming**: Implement `loading.tsx` for instant navigation feedback while heavy data (like track maps or session lists) loads.

### Asset & Rendering Optimization
*   **Dynamic Imports**: Lazy load heavy components like `TrackMap` or charts using `next/dynamic`.
*   **Image Optimization**: Ensure all track assets and user avatars use `next/image` with proper sizing.
*   **Route Groups**: Use `(dashboard)`, `(auth)`, `(marketing)` route groups to organize layouts effectively without affecting URLs.

## 2. Folder Structure Reorganization (Feature-Based)

Move away from scattering related files across `app`, `components`, and `lib`. Adopting a **Feature-Based Architecture** makes the codebase more maintainable.

```text
src/
├── app/                    # Next.js App Router (Routing layer only)
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── sessions/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── features/               # Core Business Logic
│   ├── auth/
│   ├── sessions/
│   │   ├── components/     # Session-specific components (SessionDetails, TrackMap)
│   │   ├── hooks/          # Session-specific hooks
│   │   ├── actions.ts      # Server actions for sessions
│   │   └── types.ts        # Session types
│   ├── analytics/
│   └── map/
├── components/             # Shared UI Components (Design System)
│   ├── ui/                 # Primitives (Buttons, Cards, Inputs)
│   ├── layout/             # Header, Sidebar, Footer
│   └── shared/             # Generic shared components
├── lib/                    # Utilities & Configuration
│   ├── supabase/           # Database clients
│   └── utils.ts            # Helper functions
└── types/                  # Global Types
```

## 3. UI/UX & Design System ("More Beautiful")

### Design Consistency
*   **Centralized Theme**: Define a strict color palette and typography in `globals.css` (CSS Variables) and `tailwind.config.ts`.
*   **Component Library**: Standardize on the existing UI components (likely Shadcn UI). Ensure all inputs, buttons, and cards share the same border-radius, shadow depth, and interaction states.
*   **Glassmorphism & Dark Mode**: Enhance the "racing" feel with subtle glassmorphism on dashboard cards and a deep, high-contrast dark mode.

### Animations & Interactivity
*   **Micro-interactions**: Add hover states to rows in tables and cards.
*   **Page Transitions**: Use `framer-motion` for smooth transitions between dashboard pages.
*   **Data Visualization**: Make charts and track maps interactive. Use smooth animations for live telemetry updates.

## 4. Code Consistency & Quality

### Type Safety
*   **Strict Types**: Eliminate `any`. Share types between Supabase database definitions and frontend code.
*   **Zod Validation**: Use Zod for all form validations and API response parsing to ensure data integrity.

### State Management
*   **Server State**: Use TanStack Query (React Query) or simple Server Component data passing for server state.
*   **Client State**: Use Zustand for global client-only state (e.g., sidebar toggle, active session filters) instead of prop drilling.

## 5. Migration Steps

1.  **Refactor Directory**: Create the `features` folder and start moving `components/sessions` and related logic there.
2.  **Standardize UI**: Audit all pages to ensure they use components from `components/ui`.
3.  **Optimize Data**: Convert one major page (e.g., Sessions List) to use Server Actions and Suspense.
4.  **Visual Polish**: Apply the new theme variables and animations.
