import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";
import { HTTPException } from "hono/http-exception";
import { AuthService } from "../services/auth.service";

interface AuthHonoBindings {
  Variables: {
    authService: AuthService;
  };
}

const authRoutes = new Hono<AuthHonoBindings>();
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
  authRoutes.post(
    "/resend-verification",
    rateLimitMiddleware,
    authController.resendVerification
  );
} else {
  authRoutes.post("/register", authController.register);
  authRoutes.post("/login", authController.login);
  authRoutes.get("/verify-email", authController.verifyEmail);
  authRoutes.post("/forgot-password", authController.requestPasswordReset);
  authRoutes.post("/reset-password", authController.resetPassword);
  authRoutes.post("/resend-verification", authController.resendVerification);
}

// Rutas protegidas
authRoutes.use("/profile", authMiddleware);
authRoutes.get("/profile", authController.getProfile);

// Add DELETE endpoint for user deletion
authRoutes.delete("/users/:id", authMiddleware, async (c) => {
  const userId = c.req.param("id");
  const authService = c.var.authService;
  const currentUser = getAuthUser(c);

  // Solo permitir que un usuario elimine su propia cuenta
  if (userId !== currentUser.id) {
    throw new HTTPException(403, {
      message: "You can only delete your own account",
    });
  }

  try {
    const result = await authService.deleteUser(userId);
    return c.json(result);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete user" });
  }
});

export { authRoutes };

// Lightweight session-status endpoint used by the web app to detect forced logout
authRoutes.get("/session-status", authMiddleware, async (c) => {
  try {
    const current = getAuthUser(c);
    const kv = (c.env as any).KV as KVNamespace | undefined;
    let forceLogout = false;
    if (kv && typeof kv.get === "function") {
      const flag = await kv.get(`user:forceLogout:${current.id}`);
      forceLogout = !!flag;
    }
    return c.json({ forceLogout });
  } catch (e) {
    return c.json({ forceLogout: false });
  }
});

// Add token refresh endpoint (protected)
authRoutes.post("/refresh", authMiddleware, async (c) => {
  try {
    const current = getAuthUser(c);
    const authService = c.var.authService;
    const result = await authService.refreshTokenForUser(current.id);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json((error as any).body, error.status);
    }
    return c.json({ message: "Failed to refresh token" }, 500);
  }
});
