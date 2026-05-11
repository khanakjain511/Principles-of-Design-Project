# Implementation Plan: Google Auth with Domain Whitelisting

This document outlines the steps required to integrate Google Authentication into the SmartRide Connect application, ensuring only students from whitelisted domains (`@nst.rishihood.edu.in` and `@rishihood.edu.in`) can sign in.

## 1. Google Cloud Platform (GCP) Setup
Before modifying the code, you need to register the application with Google to obtain OAuth credentials.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "SmartRide Connect").
3. Navigate to **APIs & Services** > **OAuth consent screen** and configure it (choose "External" or "Internal" depending on your Google Workspace setup).
4. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Add the following to **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://smartride-connect.vercel.app`
7. Add the following to **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://smartride-connect.vercel.app/api/auth/callback/google`
8. Copy the generated **Client ID** and **Client Secret**.

## 2. Environment Variables
Update your environment files to securely store the Google credentials.

**`.env.local` & `.env.example`**
Add the following lines:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 3. Database Schema Update (`src/models/User.ts`)
Currently, `passwordHash` is a required field. Since users logging in via Google will not have a password, we must make it optional.

**Changes required in `userSchema`:**
```typescript
passwordHash: { type: String, select: false }, // Remove `required: true`
```

## 4. NextAuth Configuration (`src/lib/auth.ts`)
We need to add the `GoogleProvider` and configure the NextAuth `signIn` callback to handle domain filtering and database synchronization.

**Changes required:**
1. Import `GoogleProvider` from `next-auth/providers/google`.
2. Add the provider to the `providers` array.
3. Add a `signIn` callback inside `authOptions.callbacks` to enforce domain whitelisting and sync the user to MongoDB.

**Example Implementation Outline:**
```typescript
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    // ... existing CredentialsProvider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // 1. Enforce Domain Whitelisting
        if (!isAllowedEmail(user.email)) {
          return false; // Blocks sign-in for unauthorized domains
        }

        // 2. Sync to MongoDB (Upsert)
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Create new user without passwordHash
          await User.create({
            email: user.email,
            name: user.name || "Student",
            image: user.image,
          });
        }
        return true;
      }
      return true; // For CredentialsProvider
    },
    // ... existing jwt and session callbacks
  }
}
```

## 5. UI Updates
Finally, update the front-end to allow users to trigger the Google login flow.

1. Install any necessary icons (e.g., using `lucide-react` or an SVG).
2. Update **`src/app/login/page.tsx`** (or your Login Form component) to include a "Sign in with Google" button.
3. Update the active auth UI to include a Google sign-in entry point.

**Button Handler Example:**
```typescript
import { signIn } from "next-auth/react";

<button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
  Sign in with Google
</button>
```

---
*Follow these steps sequentially to ensure a smooth integration without breaking the existing email/password auth.*
