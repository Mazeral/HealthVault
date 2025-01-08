import express from "express";
import AuthController from "../controllers/AuthController";

const authRouter = express.Router()

authRouter.post('/login', AuthController.login)
authRouter.get('/logout', AuthController.logout)
authRouter.post('/check-auth', AuthController.checkAuth)

export default authRouter
