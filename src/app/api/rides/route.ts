import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Ride } from "@/models/Ride";

export const dynamic = "force-dynamic";

function sanitizeWhatsapp(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export async function GET() {
  try {
    await connectDB();
    const rides = await Ride.find({ status: { $ne: "expired" } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      rides: rides.map((r) => ({ ...r, _id: String(r._id), createdBy: String(r.createdBy) })),
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

  try {
    await connectDB();
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
