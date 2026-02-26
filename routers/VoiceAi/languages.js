import express from "express";
import { listVoices } from "edge-tts-universal";
import { config } from "../../config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const voices = await listVoices();

    const languages = {};

    voices.forEach((voice) => {
      const locale = voice.Locale;

      if (!languages[locale]) {
        languages[locale] = [];
      }

      languages[locale].push({
        name: voice.ShortName,
        gender: voice.Gender,
        friendlyName: voice.FriendlyName
      });
    });

    res.json({
      status: true,
      creator: config.author,
      languages: languages
    });

  } catch (error) {
    res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Error fetching languages",
      error: error.message
    });
  }
});

export default router;