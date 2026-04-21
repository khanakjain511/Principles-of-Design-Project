import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("name email gender image")
      .lean<{
        _id: { toString(): string };
        name: string;
        email: string;
        gender?: string;
        image?: string;
      } | null>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        gender: user.gender ?? null,
        image: user.image ?? null,
      },
    });
  } catch (err) {
    console.error("GET /api/me failed:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
