import express from "express";
import { signupWithNewStore } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/signup-admin-new-store", signupWithNewStore);

export default authRoutes;