import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
const userRouter = express.Router();

// Get a user
userRouter.get("/user/:id", UserController.getUser);

// Get all users
userRouter.get("/users", UserController.allUsers);

// Create a user
userRouter.post("/users", UserController.newUser);

// Update a user
userRouter.put(
  "/user/:id",
  authMiddleware as express.RequestHandler,
  UserController.updateUser,
);

// Add a paitent to te user
userRouter.put(
  "/user/:id",
  authMiddleware as express.RequestHandler,
  UserController.updateUser,
);

// Delete a user
userRouter.delete(
  "/user/:id",
  authMiddleware as express.RequestHandler,
  UserController.deleteUser,
);
// Fetch all DOCTOR users (protected for ADMIN)
userRouter.get(
  "/users/doctors",
  authMiddleware as express.RequestHandler,
  UserController.getAllDoctors,
);

// Edit a DOCTOR user (protected for ADMIN)
userRouter.put(
  "/users/doctors/:id",
  authMiddleware as express.RequestHandler,
  UserController.editDoctor,
);

// Delete a DOCTOR user (protected for ADMIN)
userRouter.delete(
  "/users/doctors/:id",
  authMiddleware as express.RequestHandler,
  UserController.deleteDoctor,
);
userRouter.get(
  "/doctor/:doctorId/patients",
  authMiddleware as express.RequestHandler,
  UserController.getMyPatients,
);
userRouter.get(
  "/users/doctors/:id/details",
  authMiddleware as express.RequestHandler,
  UserController.getDoctorDetails,
);
export default userRouter;
