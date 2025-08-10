import { Hono } from "hono";
import { UsersController } from "../controllers/users.controller";
import { authMiddleware } from "../middleware/auth.middleware";

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

export { users as usersRoutes };
