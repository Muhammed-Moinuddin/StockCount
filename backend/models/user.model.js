import mongoose from "mongoose";
import {ADMIN, STAFF} from "../constants.js";
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
    refreshToken: {
        type: String
    }

}, {
    timestamps: true,
    collection: 'users'
});

export const User = mongoose.model("User", userSchema);