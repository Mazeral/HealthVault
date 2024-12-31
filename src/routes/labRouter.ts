import express from "express";
import LabController from "../controllers/LabController";

const labRouter = express.Router();
// Create a lab result
labRouter.post("/lab-results/:id", LabController.newLabResult);

// Get a lab result
labRouter.get("/lab-result/:id", LabController.getLabResult);

// Get all lab results
labRouter.get("/lab-results", LabController.allLabResults);

// Update a lab result
labRouter.put("/lab-results/:id", LabController.updateLabResult);

// Delete a lab result
labRouter.delete("/lab-results/:id", LabController.deleteLabResult);

export default labRouter;
