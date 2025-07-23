import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    //store code for joining
    code: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    //One store owner
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, {
    timestamps: true,
});

export const Store = mongoose.model("Store", storeSchema);