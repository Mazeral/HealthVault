import express from "express";
import session from "express-session";
import userRouter from "./routes/userRouter";
import medRecordRouter from "./routes/medRecordRouter";
import labRouter from "./routes/labRouter";
import prescriptionRouter from "./routes/prescriptionRouter";
import patientRouter from "./routes/patientRouter";
import authRouter from "./routes/AuthRouter";
import { createClient } from "redis";
const { RedisStore } = require("connect-redis");

const app = express();
const port: string = process.env.PORT || "5000";

// Routes for the application
app.use(userRouter);
app.use(medRecordRouter);
app.use(labRouter);
app.use(patientRouter);
app.use(prescriptionRouter);
app.use("/auth", authRouter);

// Initialize client.
let redisClient = createClient();
redisClient.connect().catch(console.error);

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err: Error | undefined) => {
  console.error("Redis error:", err);
});

app.use(
  session({
    store: redisStore,
    secret: "your-secret-key", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production (HTTPS only)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
