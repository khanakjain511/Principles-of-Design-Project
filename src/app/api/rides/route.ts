import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { User, type Gender } from "@/models/User";

export const dynamic = "force-dynamic";

function sanitizeWhatsapp(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length < 10) return null;
  return digits;
}

function isPastTime(dateStr: string, timeWindowStr: string): boolean {
  try {
    const startStr = timeWindowStr.split(" - ")[0];
    if (!startStr) return false;
    
    const match = startStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    
    const rideDateTime = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
    return rideDateTime < new Date();
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectDB();
    const rides = await Ride.find({ status: { $ne: "expired" } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const creatorIds = Array.from(
      new Set(rides.map((r) => String(r.createdBy)))
    );
    const creators = await User.find({ _id: { $in: creatorIds } })
      .select("gender")
      .lean<{ _id: { toString(): string }; gender?: Gender }[]>();

    const genderById = new Map<string, Gender | undefined>();
    for (const c of creators) {
      genderById.set(c._id.toString(), c.gender);
    }

    return NextResponse.json({
      rides: rides.map((r) => {
        const id = String(r.createdBy);
        return {
          ...r,
          _id: String(r._id),
          createdBy: id,
          creatorGender: genderById.get(id) ?? r.creatorGender ?? undefined,
        };
      }),
    });
  } catch (err) {
    console.error("GET /api/rides failed:", err);
    return NextResponse.json({ error: "Failed to fetch rides" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

  const from = String(body.from ?? "").trim();
  const to = String(body.to ?? "").trim();
  const date = String(body.date ?? "").trim();
  const timeWindow = String(body.timeWindow ?? "").trim();
  const whatsappRaw = String(body.whatsapp ?? "").trim();
  const notes = body.notes ? String(body.notes).trim().slice(0, 280) : undefined;

  if (!from || !to || !date || !timeWindow || !whatsappRaw) {
    return NextResponse.json(
      { error: "from, to, date, timeWindow, and whatsapp are required" },
      { status: 400 }
    );
  }

  if (from.toLowerCase() === to.toLowerCase()) {
    return NextResponse.json({ error: "From and To must differ" }, { status: 400 });
  }

  const whatsapp = sanitizeWhatsapp(whatsappRaw);
  if (!whatsapp) {
    return NextResponse.json({ error: "Invalid WhatsApp number" }, { status: 400 });
  }

  if (isPastTime(date, timeWindow)) {
    return NextResponse.json({ error: "Start time cannot be in the past" }, { status: 400 });
  }

  try {
    await connectDB();

    const creator = await User.findById(session.user.id)
      .select("gender")
      .lean<{ gender?: Gender } | null>();

    const ride = await Ride.create({
      from,
      to,
      date,
      timeWindow,
      whatsapp,
      notes,
      status: "active",
      createdBy: session.user.id,
      creatorName: session.user.name ?? "Student",
      creatorEmail: session.user.email ?? "",
      creatorImage: session.user.image ?? undefined,
      creatorGender: creator?.gender,
    });

    return NextResponse.json(
      { ride: { ...ride.toObject(), _id: String(ride._id), createdBy: String(ride.createdBy) } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/rides failed:", err);
    return NextResponse.json({ error: "Failed to create ride" }, { status: 500 });
  }
}
