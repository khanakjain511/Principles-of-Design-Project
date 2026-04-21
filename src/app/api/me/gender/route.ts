import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, GENDER_VALUES, type Gender } from "@/models/User";
import { Ride } from "@/models/Ride";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const gender = String(body.gender ?? "").trim().toLowerCase() as Gender;
  if (!GENDER_VALUES.includes(gender)) {
    return NextResponse.json({ error: "Please select a valid gender" }, { status: 400 });
  }

  try {
    await connectDB();
    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { gender } },
      { new: true, projection: "name email gender" }
    ).lean<{
      _id: { toString(): string };
      name: string;
      email: string;
      gender: Gender;
    } | null>();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Ride.updateMany(
      { createdBy: session.user.id },
      { $set: { creatorGender: gender } }
    );

    return NextResponse.json({
      user: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        gender: updated.gender,
      },
    });
  } catch (err) {
    console.error("PATCH /api/me/gender failed:", err);
    return NextResponse.json({ error: "Failed to update gender" }, { status: 500 });
  }
}
