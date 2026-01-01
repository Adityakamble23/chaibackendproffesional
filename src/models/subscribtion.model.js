import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //who subscribes
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId, //which channel is being subscribed to
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
