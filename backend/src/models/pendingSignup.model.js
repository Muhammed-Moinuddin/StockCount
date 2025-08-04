import mongoose from "mongoose";
import { STORE_TYPE } from "../../constants.js";

const { NEW_STORE, EXISTING_STORE } = STORE_TYPE;

const pendingSignupSchema = new mongoose.Schema(
  {
    type: {
      type: String, // 'NEW_STORE' or 'EXISTING_STORE'
      enum: [NEW_STORE, EXISTING_STORE],
      required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true,
    },
    fullname: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: String, // only for EXISTING_STORE
    storeId: mongoose.Schema.Types.ObjectId, // only for EXISTING_STORE
    storeName: String, // only for NEW_STORE
    storeAddress: String, // only for NEW_STORE
  },
  { timestamps: true }
);

// Automatically delete document 24 hours after createdAt
pendingSignupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const PendingSignup = mongoose.model("PendingSignup", pendingSignupSchema);
