import { Hono } from "hono";
import { UsersController } from "../controllers/users.controller";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { HTTPException } from "hono/http-exception";

const users = new Hono();
const usersController = new UsersController();

// Ruta para suscribirse manualmente al newsletter (requiere autenticación)
users.post("/subscribe", authMiddleware, usersController.subscribe);

// Ruta para verificar el estado de suscripción (requiere autenticación)
users.get(
  "/subscription-status",
  authMiddleware,
  usersController.getSubscriptionStatus
);

// Ruta para actualizar el perfil del usuario autenticado
users.put("/profile", authMiddleware, (c) => usersController.updateProfile(c));

// Admin endpoints: list users and change role
users.get("/admin/list", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  if (user.role !== "admin" && user.role !== "superAdmin") {
    return c.json({ message: "Insufficient permissions" }, 403);
  }
  return usersController.adminList(c);
});

users.post("/admin/change-role", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  if (user.role !== "admin" && user.role !== "superAdmin") {
    return c.json({ message: "Insufficient permissions" }, 403);
  }
  return usersController.adminChangeRole(c);
});

export { users as usersRoutes };
