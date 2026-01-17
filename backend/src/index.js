import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req,res)=>res.json({ok:true}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminDist = path.join(__dirname, "../../admin/dist");
const appDist = path.join(__dirname, "../../miniapp/dist");

app.use("/admin", express.static(adminDist));
app.get("/admin/*", (req,res)=>res.sendFile(path.join(adminDist, "index.html")));

app.use("/app", express.static(appDist));
app.get("/app/*", (req,res)=>res.sendFile(path.join(appDist, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running on", PORT));
