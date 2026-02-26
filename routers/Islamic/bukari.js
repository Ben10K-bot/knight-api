import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

const BUKARI_JSON = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/refs/heads/main/hadith/bukhari.json';

router.get('/', async (req, res) => {
    res.json({
        status: true,
        creator: config.author,
        message: "Welcome to Bukari Hadith API. Use /all to get all hadiths, or /search with query parameters 'num' and/or 'page'."
    });
});

router.get('/all', async (req, res) => {
    try {
        const response = await fetch(BUKARI_JSON);
        if (!response.ok) throw new Error(`Failed to fetch Bukari hadiths: ${response.status}`);
        const data = await response.json();

        const hadithsArray = data.hadiths;
        if (!Array.isArray(hadithsArray)) {
            return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: hadithsArray
        });
    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

router.get('/search', async (req, res) => {
    const { num, page } = req.query; 
    try {
        const response = await fetch(BUKARI_JSON);
        if (!response.ok) throw new Error(`Failed to fetch Bukari hadiths: ${response.status}`);
        const data = await response.json();

        const hadithsArray = data.hadiths;
        if (!Array.isArray(hadithsArray)) {
            return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
        }

        let filtered = hadithsArray;
        if (num) {
            filtered = filtered.filter(h => Number(h.hadith_number) === Number(num));
            if (filtered.length === 0) {
                return res.status(404).json({
                    status: false,
                    creator: config.author,
                    error: `Hadith number ${num} not found`
                });
            }
        }

        if (page) {
            filtered = filtered.filter(h => Number(h.page) === Number(page));
            if (filtered.length === 0) {
                return res.status(404).json({
                    status: false,
                    creator: config.author,
                    error: `Hadith number ${num || 'any'} with page ${page} not found`
                });
            }
        }

        if (page) {
            return res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: filtered
            });
        }

        const grouped = [];
        const hadithNumbers = [...new Set(filtered.map(h => h.hadith_number))];

        hadithNumbers.forEach(num => {
            const pages = filtered.filter(h => Number(h.hadith_number) === num);
            grouped.push({
                hadith_number: num,
                pages: pages.map(p => p.page),
                text: pages.map(p => p.text)
            });
        });

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: grouped
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
