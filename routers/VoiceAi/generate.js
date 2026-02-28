import express from "express";
import { spawn } from "child_process";
import { config } from "../../config.js"

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const text = req.query.text;
        const voice = req.query.voice || "en-US-AvaNeural";
        const rate = req.query.rate || "+0%";
        const volume = req.query.volume || "+0%";
        const pitch = req.query.pitch || "+0Hz";

        if (!text) {
            return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Text is required"
  });
        }

        const child = spawn("python", [
            "-m", "edge_tts",
            "--text", text,
            "--voice", voice,
            "--rate", rate,
            "--volume", volume,
            "--pitch", pitch,
            "--write-media", "-"
        ]);

        res.setHeader("Content-Type", "audio/mpeg");

        child.stdout.pipe(res);

        child.on("error", () => {
            if (!res.headersSent) {
                res.status(500).end();
            }
        });

        child.on("close", () => {
            res.end();
        });

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;
