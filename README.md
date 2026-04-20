# Campus Rides

A minimal, internal notice board for students at Rishihood / NST to coordinate
shared rides between campus (Sonipat) and nearby cities (Delhi, Gurgaon,
Noida, etc.).

This app is **not** Uber. It does not handle payments, real-time bookings, or
seat tracking. Students post a ride, others contact them on WhatsApp, and the
ride owner manually marks the ride as full when seats are filled.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- NextAuth (Credentials provider, JWT sessions) + bcryptjs for password hashing
- MongoDB via Mongoose
- Tailwind CSS

## Features

**Phase 1 — Authentication**

- Email + password sign-in restricted to `@nst.rishihood.edu.in` and
  `@rishihood.edu.in`
- Self-signup at `/signup`, passwords are bcrypt-hashed and stored on the
  `User` document
- JWT session strategy
- Protected `/dashboard` and `/rides/*` routes via middleware

**Phase 2 — Ride board**

- `POST /api/rides` — create a ride (auth required)
- `GET /api/rides` — list active / full rides
- `PATCH /api/rides/:id` — update status (creator only)
- `DELETE /api/rides/:id` — remove a ride (creator only)
- Dashboard groups rides into _Leaving Campus_, _Coming to Campus_, _Other Routes_
- Each ride card has a one-tap WhatsApp contact button

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   - `MONGODB_URI` — connection string for your MongoDB instance
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Project structure

```
src/
  app/
    api/
      auth/[...nextauth]/route.ts   # NextAuth handler
      auth/signup/route.ts          # Create account
      rides/route.ts                # GET, POST
      rides/[id]/route.ts           # PATCH, DELETE
    dashboard/page.tsx              # Ride board
    login/page.tsx                  # Sign-in page
    signup/page.tsx                 # Create account
    rides/new/page.tsx              # Create ride form page
    layout.tsx
    page.tsx                        # Redirects based on auth
  components/
    CreateRideForm.tsx
    LoginForm.tsx
    Navbar.tsx
    Providers.tsx
    RideCard.tsx
    RideFeed.tsx
    SignOutButton.tsx
    SignupForm.tsx
    StatusBadge.tsx
  lib/
    auth.ts                         # NextAuth options
    constants.ts
    db.ts                           # Cached Mongoose connection
    format.ts
  models/
    Ride.ts
    User.ts
middleware.ts                       # Protects /dashboard and /rides
```

## Notes

- WhatsApp number is collected per ride (the form requires it). It is not
  pulled from Google because OAuth doesn't expose phone numbers.
- The `Ride` schema also stores a denormalized snapshot of the creator
  (`creatorName`, `creatorEmail`, `creatorImage`) so the feed renders without
  joins.
- Ride status defaults to `active`. Owners can flip between `active` and
  `full` from their card. `expired` is reserved for future cleanup jobs.
