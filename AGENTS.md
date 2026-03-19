<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions for Journal

## Project Overview

This is a Next.js 16.2.0 project with:
- React 19.2.4 (App Router)
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Convex backend
- ESLint 9 with `eslint-config-next`

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (no test runner configured)

# Type Checking (run manually)
npx tsc --noEmit     # TypeScript type checking
```

Note: No test framework is currently configured. If adding tests, use Vitest with `@vitest/ui`.

## Code Style Guidelines

### TypeScript Conventions

- Use strict TypeScript (`strict: true` in tsconfig.json)
- Use explicit types for function parameters and return types
- Prefer `type` over `interface` for object types unless interface extension is needed
- Use `Readonly<T>` for immutable data structures
- Avoid `any` type; use `unknown` when type is truly unknown

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions/Hooks**: camelCase (e.g., `useAuth`, `fetchUserData`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase otherwise
- **Files**: kebab-case for non-component files (e.g., `api-utils.ts`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`, `ApiResponse<T>`)

### Import Conventions

Order imports as follows (enforced by ESLint):
1. Node.js built-ins (e.g., `import fs from 'fs'`)
2. External packages (e.g., `import next from 'next'`)
3. Internal modules (e.g., `import { auth } from '@/lib/auth'`)
4. Type imports (use `import type` for type-only imports)

```typescript
// Type-only imports
import type { Metadata } from "next";
import { useState } from "react";
import { SomeComponent } from "@/components/SomeComponent";
```

### Component Patterns

- Use Server Components by default in `app/` directory
- Add `'use client'` directive only when client-side interactivity is needed
- Prefer composition over prop drilling
- Export page/layout components as default exports
- Export utility components as named exports

```typescript
// Page component (default export)
export default function HomePage() { ... }

// Utility component (named export)
export function Button({ children }: { children: React.ReactNode }) { ... }
```

### React/JSX Patterns

- Use `React.FC` sparingly; prefer function declarations with explicit props
- Use `React.ReactNode` for children prop type
- Use `Readonly<{...}>` wrapper for page component props
- Always provide `alt` text for images
- Use `priority` prop on above-fold images with `next/image`

### Tailwind CSS 4 Patterns

- Use `@import "tailwindcss"` in CSS files (not `@tailwind base/components/utilities`)
- Use `@theme` directive for custom CSS variables
- Use inline class syntax for conditional classes
- Prefer Tailwind's color palette (e.g., `bg-zinc-50`, `text-zinc-950`)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

### Error Handling

- Use `try/catch` for async operations with specific error handling
- Create custom error types/classes for domain-specific errors
- Never swallow errors silently; log or re-throw with context
- Use `error.tsx` and `loading.tsx` files in route segments for error boundaries

### File Structure

```
app/
├── layout.tsx          # Root layout (server component)
├── page.tsx           # Home page
├── globals.css        # Global styles
├── error.tsx          # Error boundary
├── loading.tsx       # Loading states
└── [route]/           # Route segments
    ├── page.tsx       # Page component
    ├── loading.tsx    # Segment loading
    └── error.tsx      # Segment error boundary

components/            # Reusable UI components
lib/                   # Utility functions and helpers
convex/                # Backend functions
types/                 # Shared TypeScript types
```

### Convex Backend

- API functions go in `convex/` directory
- Use Convex's generated types (in `_generated/`)
- Never expose API keys or secrets in client code

### Next.js 16 Specific

- Use `next/font` for font optimization
- Use `next/image` for optimized images
- Prefer Server Actions over API routes when possible
- Use `generateMetadata()` for dynamic metadata
- Avoid `use client` unless necessary; prefer Server Components
