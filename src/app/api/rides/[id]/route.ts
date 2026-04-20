import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { RIDE_STATUSES, type RideStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid ride id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status as RideStatus | undefined;
  if (!status || !(RIDE_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${RIDE_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const ride = await Ride.findById(params.id);
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (String(ride.createdBy) !== session.user.id) {
      return NextResponse.json(
        { error: "Only the ride creator can update its status" },
        { status: 403 }
      );
    }

    ride.status = status;
    await ride.save();

    return NextResponse.json({
      ride: { ...ride.toObject(), _id: String(ride._id), createdBy: String(ride.createdBy) },
    });
  } catch (err) {
    console.error("PATCH /api/rides/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update ride" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid ride id" }, { status: 400 });
  }

  try {
    await connectDB();
    const ride = await Ride.findById(params.id);
    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (String(ride.createdBy) !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await ride.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/rides/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete ride" }, { status: 500 });
  }
}
