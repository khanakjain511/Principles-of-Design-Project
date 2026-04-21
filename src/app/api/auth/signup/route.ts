import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, GENDER_VALUES, type Gender } from "@/models/User";
import { isAllowedEmail } from "@/lib/auth";
import { ALLOWED_DOMAINS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const gender = String(body.gender ?? "").trim().toLowerCase() as Gender;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      { error: `Only ${ALLOWED_DOMAINS.join(" or ")} accounts are allowed` },
      { status: 403 }
    );
  }
  if (!GENDER_VALUES.includes(gender)) {
    return NextResponse.json({ error: "Please select your gender" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email }).select("_id").lean();
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, name, gender, passwordHash });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/signup failed:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
