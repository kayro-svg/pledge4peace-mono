import { Hono } from "hono";
import { VolunteerController } from "../controllers/volunteer.controller";

const volunteer = new Hono();
const volunteerController = new VolunteerController();

// Ruta para enviar aplicación de voluntario (pública, no requiere autenticación)
volunteer.post("/apply", volunteerController.submitApplication);

export { volunteer as volunteerRoutes };
