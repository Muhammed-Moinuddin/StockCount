import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2
    },
    address: {
        type: String,
        trim: true,
    },
    //store code for joining
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    //One store owner
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    }
}, {
    timestamps: true,
});

export const Store = mongoose.model("Store", storeSchema);