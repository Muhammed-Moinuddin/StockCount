import express from "express";
import { signupWithNewStore, verifyAdminNewStore } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/signup-admin-new-store", signupWithNewStore);
authRoutes.get("/verify-admin", verifyAdminNewStore);

export default authRoutes;