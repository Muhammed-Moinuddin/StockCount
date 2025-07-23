import mongoose, {Schema} from "mongoose";

const supplierSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    company: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: [true,"Email is already in use."],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        unique: [true, "Phone number is already in use."],
        minlength: 8,
    }
}, {
    timestamps: true,
});

export const Supplier = mongoose.model("Supplier", supplierSchema);