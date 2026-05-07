# Way of Working & Coding Guidelines

## Architecture & Framework
- **Next.js 14 App Router**: Use the App Router conventions (`app/` directory). 
- **Server vs Client Components**: Default to Server Components for performance and SEO. Use `"use client"` directive only when necessary (e.g., for interactivity, hooks like `useState` or `useEffect`, or browser APIs).
- **Routing & API**: Use Route Handlers (`app/api/.../route.ts`) for backend API endpoints.

## Language & Typing
- **TypeScript**: Use TypeScript strictly. Define interfaces and types for all props, states, and API responses.
- Avoid using `any`.

## Styling
- **Tailwind CSS**: Use Tailwind CSS for all styling. Avoid custom CSS files unless absolutely necessary.
- Ensure designs are fully responsive using Tailwind's breakpoint utilities (`sm:`, `md:`, `lg:`).

## Database & Models
- **Mongoose**: Use Mongoose for defining MongoDB schemas and interacting with the database.
- **Connection Management**: Utilize the cached DB connection utility (`lib/db.ts`) to avoid opening multiple connections during development and serverless deployments.
- **Denormalization**: As established in the `Ride` model, denormalize data where it makes sense to avoid expensive joins (e.g., storing creator details directly on the ride document).

## Authentication & Security
- **NextAuth**: Use NextAuth for handling sessions.
- **Middleware**: Use Next.js Middleware (`middleware.ts`) as private-by-default protection. Keep `/login`, `/signup`, and required NextAuth endpoints public; protect new pages and APIs unless they are explicitly auth-related.
- **Server-side Checks**: Always verify the user's session and permissions in Server Actions or Route Handlers before performing sensitive operations (e.g., only the creator can update or delete their ride).
- **Passwords**: Never store plain text passwords. Always use `bcryptjs` for hashing and verification.

## Notifications
- Use `react-hot-toast` for user-facing task feedback, including validation errors, ride creation, status updates, delete confirmation, and delete results.
- Avoid blocking browser `alert` / `confirm` dialogs for core ride workflows so mobile and desktop experiences stay consistent.

## Git & Version Control
- Commit often with descriptive messages.
- Do not commit `.env.local` or any secrets.

## Component Structure
- Keep components small, focused, and reusable within the `src/components/` directory.
- Use explicit prop types for every component.
