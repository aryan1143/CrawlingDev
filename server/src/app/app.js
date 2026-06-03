import express from "express";
import cors from "cors";
import router from "./routes.js";
import middleware from "./middleware.js";

const app = express();

app.use(middleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

export default app;
