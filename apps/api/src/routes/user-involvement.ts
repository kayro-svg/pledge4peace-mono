import { Hono } from "hono";
import { UserInvolvementController } from "../controllers/user-involvement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const userInvolvement = new Hono();
const userInvolvementController = new UserInvolvementController();

// Get user involvement dashboard data
userInvolvement.get(
  "/dashboard",
  authMiddleware,
  userInvolvementController.getDashboard
);

// Get user involvement stats only
userInvolvement.get(
  "/stats",
  authMiddleware,
  userInvolvementController.getStats
);

// Get user recent activity (pledge history)
userInvolvement.get(
  "/activity",
  authMiddleware,
  userInvolvementController.getActivity
);

// Get user recent comments
userInvolvement.get(
  "/comments",
  authMiddleware,
  userInvolvementController.getComments
);

export { userInvolvement as userInvolvementRoutes };
