import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ALLOWED_DOMAINS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return (ALLOWED_DOMAINS as readonly string[]).includes(domain);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;
        if (!isAllowedEmail(email)) return null;

        await connectDB();
        const user = await User.findOne({ email })
          .select("+passwordHash name email image")
          .lean<{
            _id: { toString(): string };
            email: string;
            name: string;
            image?: string;
            passwordHash: string;
          } | null>();

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = (user.image as string | undefined) ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
