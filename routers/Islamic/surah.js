import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

const SURAH_JSON = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/refs/heads/main/surah.json';

router.get('/', async (req, res) => {
    res.json({
        status: true,
        creator: config.author,
        message: "Use endpoints: /all, /:surahNumber"
    });
});

router.get('/all', async (req, res) => {
    try {
        const response = await fetch(SURAH_JSON);
        if (!response.ok) throw new Error(`Failed to fetch Quran JSON: ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: data
        });
    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

router.get('/:surahNumber', async (req, res) => {
    const number = req.params.surahNumber;
    if (isNaN(number)) {
        return res.status(400).json({
            status: false,
            creator: config.author,
            error: "Surah number must be a valid number, e.g., /1 for Al-Fatiha"
        });
    }
    try {
        const response = await fetch(SURAH_JSON);
        if (!response.ok) throw new Error(`Failed to fetch Quran JSON: ${response.status}`);
        const data = await response.json();

        const surah = data.find(s => Number(s.number) === Number(number));

        if (!surah) {
            return res.status(404).json({
                status: false,
                creator: config.author,
                error: `Surah number ${number} not found`
            });
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: surah
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
