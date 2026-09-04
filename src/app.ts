import express from "express";
import repositoryRoutes from "./modules/respository/routes/repository.routes.js";

const app = express();

app.use(express.json());

app.use("/api/repository", repositoryRoutes);

export default app;