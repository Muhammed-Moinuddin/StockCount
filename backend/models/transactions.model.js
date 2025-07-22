import mongoose from "mongoose";
import { TRANSACTION_TYPE, PAYMENT_STATUS, PARTY_TYPES } from "../constants";

const { SALE, PURCHASE } = TRANSACTION_TYPE;
const {PAID, UNPAID, PARTIAL} = PAYMENT_STATUS;
const {CUSTOMER, SUPPLIER} = PARTY_TYPES;
const { Schema } = mongoose;

const transactionSchema = new Schema({
    // Core Transaction Info
    store: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    type: {
        type: String,
        enum: [SALE, PURCHASE],
        required: true
    },

    // Items List
    items: [{
        product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
        },
        quantity: {
        type: Number,
        required: true,
        min: 1
        },
        unitPrice: {
        type: Number,
        required: true,
        min: 0
        }
    }],

    // Party Information
    party: {
        type: Schema.Types.ObjectId,
        refPath: 'partyType',
        required: true
    },
    partyType: {
        type: String,
        enum: [CUSTOMER, SUPPLIER],
        required: true
    },

    // Financials
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    discountAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: [PAID, UNPAID, PARTIAL],
        default: UNPAID,
    },
    paidAmount: {
        type: Number,
        default: 0
    },

    // Operational
    invoiceNumber: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);