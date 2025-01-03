import express from "express";
import userRouter from "./routes/userRouter";
import medRecordRouter from "./routes/medRecordRouter";
import labRouter from "./routes/labRouter";
import prescriptionRouter from "./routes/prescriptionRouter";
import patientRouter from "./routes/patientRouter";

const app = express();
const port: string = process.env.PORT || "5000";

app.use(express.json());

// Routes for the application
app.use(userRouter);
app.use(medRecordRouter);
app.use(labRouter);
app.use(patientRouter);
app.use(prescriptionRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
