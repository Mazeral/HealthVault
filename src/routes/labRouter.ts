import express from "express";
import LabController from "../controllers/LabController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
authMiddleware;

const labRouter = express.Router();

labRouter.post(
  "/lab-results",
  authMiddleware as express.RequestHandler,
  LabController.newLabResult,
);
// Apply authMiddleware to specific routes
labRouter.post(
  "/lab-results/:id",
  authMiddleware as express.RequestHandler,
  LabController.newLabResult,
); // Protected
labRouter.get(
  "/lab-result/:id",
  authMiddleware as express.RequestHandler,
  LabController.getLabResult,
); // Protected
labRouter.get("/lab-results", LabController.allLabResults); // Public
labRouter.delete(
  "/lab-results/:id",
  authMiddleware as express.RequestHandler,
  LabController.deleteLabResult,
); // Protected
labRouter.put(
  "/lab-results/:id",
  authMiddleware as express.RequestHandler,
  LabController.updateLabResult,
); // Protected

export default labRouter;
