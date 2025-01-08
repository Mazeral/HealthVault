import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
const userRouter = express.Router();

// Get a user
userRouter.get("/user/:id", UserController.getUser);

// Get all users
userRouter.get("/users", UserController.allUsers);

// Create a user
userRouter.post(
  "/users",
  authMiddleware as express.RequestHandler,
  UserController.newUser,
);

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

export default userRouter;
