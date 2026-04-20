import { Schema, model, models, Types, type Model } from "mongoose";
import { RIDE_STATUSES, type RideStatus } from "@/lib/constants";

export interface RideDoc {
  _id: Types.ObjectId;
  from: string;
  to: string;
  date: string;
  timeWindow: string;
  whatsapp: string;
  notes?: string;
  status: RideStatus;
  createdBy: Types.ObjectId;
  creatorName: string;
  creatorEmail: string;
  creatorImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<RideDoc>(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    timeWindow: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 280 },
    status: {
      type: String,
      enum: RIDE_STATUSES,
      default: "active",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    creatorName: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    creatorImage: { type: String },
  },
  { timestamps: true }
);

rideSchema.index({ createdAt: -1 });

export const Ride: Model<RideDoc> =
  (models.Ride as Model<RideDoc>) || model<RideDoc>("Ride", rideSchema);
