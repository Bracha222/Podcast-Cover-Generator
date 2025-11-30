import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import audio from "./routes/audio.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
	const now = new Date().toISOString();
	console.log(`${now} -> ${req.method} ${req.originalUrl} - Content-Type: ${req.headers['content-type'] || ''}`);
	next();
});
app.use("/api/audio/general", audio);

export default app;
