import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const authRoutes = new Hono();
const authController = new AuthController();

const isProd = process.env.NODE_ENV === "production";

// Rutas públicas
if (isProd) {
  authRoutes.post("/register", rateLimitMiddleware, authController.register);
  authRoutes.post("/login", rateLimitMiddleware, authController.login);
  authRoutes.get(
    "/verify-email",
    rateLimitMiddleware,
    authController.verifyEmail
  );
  authRoutes.post(
    "/forgot-password",
    rateLimitMiddleware,
    authController.requestPasswordReset
  );
  authRoutes.post(
    "/reset-password",
    rateLimitMiddleware,
    authController.resetPassword
  );
} else {
  authRoutes.post("/register", authController.register);
  authRoutes.post("/login", authController.login);
  authRoutes.get("/verify-email", authController.verifyEmail);
  authRoutes.post("/forgot-password", authController.requestPasswordReset);
  authRoutes.post("/reset-password", authController.resetPassword);
}

// Rutas protegidas
authRoutes.use("/profile", authMiddleware);
authRoutes.get("/profile", authController.getProfile);

export { authRoutes };
