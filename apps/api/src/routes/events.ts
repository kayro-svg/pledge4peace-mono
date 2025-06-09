import { Hono } from "hono";
import { EventsController } from "../controllers/events.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const events = new Hono();
const eventsController = new EventsController();

// Ruta para registrarse a un evento (requiere autenticación)
events.post("/register", authMiddleware, eventsController.registerToEvent);

// Ruta para verificar el estado de registro a un evento (requiere autenticación)
events.get(
  "/registration-status/:eventId",
  authMiddleware,
  eventsController.getEventRegistrationStatus
);

export { events as eventsRoutes };
