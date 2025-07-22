import mongoose, {Schema} from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    brand: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    sku: {
        type: String,
        required: true,
        trim: true
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },
    sellPrice: {
        type: Number,
        required: true,
        min: 0
    },
    stockQty: {
        type: Number,
        default: 0,
        min: 0
    },
    lowStockAlert: {
        type: Number, 
        default: 5 
    },
}, {
    timestamps: true,
});

//compound index ensures sku + store uniqueness
productSchema.index({ store: 1, sku: 1 }, { unique: true });

export const Product = mongoose.model("Product", productSchema);