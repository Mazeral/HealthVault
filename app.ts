import express from "express";
import userRouter from "./src/routes/userRouter";
import medRecordRouter from "./src/routes/medRecordRouter";
import labRouter from "./src/routes/labRouter";
import prescriptionRouter from "./src/routes/prescriptionRouter";
import patientRouter from "./src/routes/patientRouter";

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
