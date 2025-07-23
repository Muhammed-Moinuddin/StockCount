import mongoose from "mongoose";
import { STOCK_MOVEMENT_REASON } from "../constants";

const {IN, OUT, ADJUSTMENT} = STOCK_MOVEMENT_REASON;

const stockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: [IN, OUT, ADJUSTMENT],
        required: true,
    },
    reason: {
        type: String, // e.g., "Purchase", "Sale", "Damage"
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{
    timestamps: true,
});

export const stockMovement = mongoose.model("StockMovement", stockMovementSchema);