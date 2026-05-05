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

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB via Mongoose
- **Authentication**: NextAuth (Credentials provider with bcryptjs for password hashing, JWT sessions)

## Key Entities
1. **User**: Represents a student. Requires university email for sign-up.
2. **Ride**: Represents a ride offering. Stores route information, departure time, capacity, WhatsApp contact number, and denormalized creator details for efficient querying.

## Development Setup
- Requires Node.js and npm.
- Requires a MongoDB connection string (`MONGODB_URI`).
- Requires NextAuth configuration (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`).
