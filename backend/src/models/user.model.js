import mongoose from "mongoose";
import {ROLES} from "../../constants.js"

const { ADMIN, STAFF } = ROLES;
const { Schema } = mongoose;


const userSchema = new Schema({
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
    role: {
        type: String,
        enum: [ADMIN, STAFF],
        default: STAFF,
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    isOwner: {
        type: Boolean,
        default: false // only the first admin that creates the store is owner
    },
    refreshToken: {
        type: String
    }

}, {
    timestamps: true,
}); 

export const User = mongoose.model("User", userSchema);