import { Router } from "express";
import { login, verifyMfa, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();
r.post("/login", login);
r.post("/verify-mfa", verifyMfa);
r.get("/me", requireAuth, me);
r.post("/logout", requireAuth, logout);
export default r;