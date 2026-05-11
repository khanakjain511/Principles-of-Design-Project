# SmartRide Connect - Project Context

## Project Overview
SmartRide Connect (also referred to as `campus-rides`) is a minimal, internal notice board for students at Rishihood / NST to coordinate shared rides between the campus (Sonipat) and nearby cities (Delhi, Gurgaon, Noida, etc.).

## Core Philosophy
- **Not an Uber Clone**: The app does not handle payments, real-time bookings, or seat tracking. 
- **Simple Coordination**: Students post a ride, others contact them on WhatsApp using the provided number.
- **Manual Management**: The ride owner manually marks the ride as full when seats are filled.

## Target Audience
Students at Rishihood University / NST holding an email address with domains:
- `@nst.rishihood.edu.in`
- `@rishihood.edu.in`
- `@csds.rishihood.edu.in`
- `@psy.rishihood.edu.in`
- `@makers.rishihood.edu.in`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB via Mongoose
- **Authentication**: NextAuth (Google OAuth + Credentials provider with bcryptjs for password hashing, JWT sessions)
- **Notifications**: `react-hot-toast` for global UI notifications

## Access Model
- The app is private by default. Next.js Middleware protects all application and API routes unless explicitly excluded.
- Public unauthenticated routes are `/login` and the required NextAuth endpoints under `/api/auth/*`.
- Ride creation, status changes, deletion, and validation feedback use `react-hot-toast` notifications so the interaction pattern is consistent on mobile and desktop.

## Key Entities
1. **User**: Represents a student. Access is restricted to approved university email domains.
2. **Ride**: Represents a ride offering. Stores route information, departure time, capacity, WhatsApp contact number, and denormalized creator details for efficient querying.

## Development Setup
- Requires Node.js and npm.
- Requires a MongoDB connection string (`MONGODB_URI`).
- Requires NextAuth configuration (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`).
- Requires Google OAuth configuration (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
