import express from "express";
import session from "express-session";
import userRouter from "./routes/userRouter";
import medRecordRouter from "./routes/medRecordRouter";
import labRouter from "./routes/labRouter";
import prescriptionRouter from "./routes/prescriptionRouter";
import patientRouter from "./routes/patientRouter";
import authRouter from "./routes/AuthRouter";
import connectRedis from "connect-redis";
import Redis from "ioredis";

const app = express();
const port: string = process.env.PORT || "5000";

app.use(express.json());

// Routes for the application
app.use(userRouter);
app.use(medRecordRouter);
app.use(labRouter);
app.use(patientRouter);
app.use(prescriptionRouter);
app.use('auth', authRouter);

// Session middleware
//
const RedisStore = connectRedis(session);
const redisClient = new Redis();
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "your-secret-key", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production (HTTPS only)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
