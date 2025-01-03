import express from "express";
import UserController from "../controllers/UserController";
const userRouter = express.Router();

// Get a user
userRouter.get("/user/:id", UserController.getUser);

// Get all users
userRouter.get("/users", UserController.allUsers);

// Create a user
userRouter.post("/users", UserController.newUser);

// Update a user
userRouter.put("/user/:id", UserController.updateUser);

// Add a paitent to te user
userRouter.put("/user/:id", UserController.updateUser);

// Delete a user
userRouter.delete("/user/:id", UserController.deleteUser);

export default userRouter;
