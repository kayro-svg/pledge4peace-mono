import { Hono } from "hono";
import { ContactController } from "../controllers/contact.controller";

const contact = new Hono();
const contactController = new ContactController();

// Ruta para enviar formulario de contacto (pública, no requiere autenticación)
contact.post("/submit", contactController.submitContactForm);

export { contact as contactRoutes };
