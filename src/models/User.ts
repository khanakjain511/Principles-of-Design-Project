import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { GENDER_VALUES } from "@/lib/gender";

export { GENDER_VALUES } from "@/lib/gender";
export type { Gender } from "@/lib/gender";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: GENDER_VALUES,
    },
    image: { type: String },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
