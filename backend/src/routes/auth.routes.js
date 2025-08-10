import express from "express";
import { signupWithExistingStore, signupWithNewStore, verifyAdminNewStore, verifyJoinExistingStore } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/signup-admin-new-store", signupWithNewStore);
authRoutes.get("/verify-admin-new-store", verifyAdminNewStore);
authRoutes.post("/signup-with-existing-store", signupWithExistingStore);
authRoutes.get("/verify-join-existing-store", verifyJoinExistingStore);

export default authRoutes;