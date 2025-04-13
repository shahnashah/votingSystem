import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import connectDB from "./src/config/db.js";
import organizationRoutes from "./src/routes/organizationRoutes.js";
import authRoutes from "./src/routes/auth.routes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import electionRoutes from "./src/routes/electionRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import nominationRoutes from "./src/routes/nominationRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";


dotenv.config();


const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Expires',
      'Params'
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());



connectDB();

app.use("/api/organizations", organizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/post", postRoutes);
app.use("/api/nomination", nominationRoutes);
app.use("/api/candidates", candidateRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});