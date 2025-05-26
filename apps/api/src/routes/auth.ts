import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRoutes = new Hono();
const authController = new AuthController();

// Rutas públicas
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/verify-email", authController.verifyEmail);
authRoutes.post("/forgot-password", authController.requestPasswordReset);
authRoutes.post("/reset-password", authController.resetPassword);

// Rutas protegidas
authRoutes.use("/profile", authMiddleware);
authRoutes.get("/profile", authController.getProfile);

export { authRoutes };
