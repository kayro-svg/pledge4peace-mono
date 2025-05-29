import { Hono } from "hono";
import { SolutionsController } from "../controllers/solutions.controller";
import { CommentsController } from "../controllers/comments.controller";
import { InteractionsController } from "../controllers/interactions.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const solutionsRoutes = new Hono();
const solutionsController = new SolutionsController();
const commentsController = new CommentsController();
const interactionsController = new InteractionsController();

// Rutas públicas (no requieren autenticación)
solutionsRoutes.get(
  "/campaign/:campaignId",
  optionalAuthMiddleware,
  solutionsController.getSolutionsByCampaign
);
solutionsRoutes.get(
  "/:id",
  optionalAuthMiddleware,
  solutionsController.getSolutionById
);
solutionsRoutes.get(
  "/:solutionId/comments",
  optionalAuthMiddleware,
  commentsController.getCommentsBySolution
);
solutionsRoutes.get(
  "/:solutionId/stats",
  optionalAuthMiddleware,
  interactionsController.getInteractionStats
);
solutionsRoutes.get(
  "/campaign/:campaignId/stats",
  optionalAuthMiddleware,
  solutionsController.getSolutionsStatsByCampaign
);

// Rutas que requieren autenticación
solutionsRoutes.use("*", authMiddleware); // Aplicar autenticación a todas las rutas siguientes

solutionsRoutes.post("/", solutionsController.createSolution);
solutionsRoutes.patch("/:id/status", solutionsController.updateSolutionStatus);

// Rutas de comentarios que requieren autenticación
solutionsRoutes.post("/:solutionId/comments", commentsController.createComment);
solutionsRoutes.patch("/comments/:id", commentsController.updateComment);
solutionsRoutes.delete("/comments/:id", commentsController.deleteComment);

// Rutas de interacciones que requieren autenticación
solutionsRoutes.post("/:solutionId/like", interactionsController.toggleLike);
solutionsRoutes.post(
  "/:solutionId/dislike",
  interactionsController.toggleDislike
);
solutionsRoutes.post(
  "/:solutionId/share",
  interactionsController.shareSolution
);
solutionsRoutes.get(
  "/:solutionId/user-interactions",
  interactionsController.getUserInteractions
);

export { solutionsRoutes };
