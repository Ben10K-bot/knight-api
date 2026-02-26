import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

const ALL_FLAGS = ["nsfw", "religious", "political", "racist", "sexist", "explicit"];

router.get('/', async (req, res) => {
    const { category = 'Any', whitelist, lang = 'en' } = req.query;

    try {
        const allowedFlags = whitelist
            ? whitelist.split(',').map(f => f.trim())
            : [];

        let joke = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {

            const url = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?lang=${encodeURIComponent(lang)}`;

            const response = await axios.get(url);
            const data = response.data;

            if (data.error) break;

            const flags = data.flags;

            const isValid = ALL_FLAGS.every(flag => {
                if (!flags[flag]) return true;
                return allowedFlags.includes(flag);
            });

            if (isValid) {
                joke = data;
                break;
            }

            attempts++;
        }

        if (!joke) {
            return res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "No joke found matching whitelist flags"
  });
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: joke
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