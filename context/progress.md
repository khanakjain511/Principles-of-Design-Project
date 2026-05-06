# Project Progress

## Phase 1: Authentication
- [x] Initial Next.js 14 App Router setup
- [x] NextAuth configuration with Credentials provider
- [x] User schema and Mongoose integration for auth
- [x] Email restriction (`@nst.rishihood.edu.in` and `@rishihood.edu.in`)
- [x] Password hashing using `bcryptjs`
- [x] Sign-up page (`/signup`)
- [x] Sign-in page (`/login`)
- [x] JWT session strategy implemented
- [x] Route protection via Next.js Middleware (`middleware.ts` protecting `/dashboard` and `/rides/*`)

## Phase 2: Ride Board
- [x] Ride schema creation (with denormalized creator snapshot)
- [x] Ride APIs (`/api/rides` - GET, POST)
- [x] Ride management APIs (`/api/rides/[id]` - PATCH, DELETE)
- [x] Dashboard UI grouping rides (Leaving Campus, Coming to Campus, Other Routes)
- [x] Create ride form (`/rides/new`)
- [x] Ride card UI with WhatsApp integration
- [x] Ability for owners to flip status (active <-> full)
- [x] Ability for owners to delete rides

## Upcoming / Pending Tasks
- [ ] Implement automated cleanup jobs for 'expired' rides (as mentioned in notes).
- [ ] Extensive testing of auth edge cases and API protection.
- [ ] UI/UX refinements (design polish, responsive testing).

## Phase 3: Google Auth with Domain Whitelisting *(Completed)*
- [x] `.env.example` updated with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [x] `User.ts` — `passwordHash` made optional (Google users have no password)
- [x] `auth.ts` — Added `GoogleProvider` to NextAuth config
- [x] `auth.ts` — Added `signIn` callback enforcing domain whitelist via `isAllowedEmail`
- [x] `auth.ts` — Auto-creates user in MongoDB on first Google sign-in (upsert)
- [x] `auth.ts` — Bug fix: ensured token.id is mapped to MongoDB `_id` instead of Google ID
- [x] `LoginForm.tsx` — Added "Sign in with Google" button with Google icon + divider
- [x] `SignupForm.tsx` — Added "Sign up with Google" button with Google icon + divider
- [x] Implementation plan saved in `context/google-auth-plan.md`
- [x] **GCP Setup & Env Config** — Credentials added and successfully tested locally and in production.

## Phase 4: Production Polish & Validations *(Completed)*
- [x] Integrated `react-hot-toast` for elegant global notifications.
- [x] Upgraded "Time Window" input to use strict `type="time"` fields.
- [x] Added strict front-end validations (future time checks, phone number format).
- [x] Added strict back-end validations in `POST /api/rides` to prevent API bypassing.
