import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

function getTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
}

router.get('/', async (req, res) => {
    const { city, country, date } = req.query;

    if (!city || !country) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query parameters. Required: city, country"
  });
    }

    const useDate = date ? date.replace(/\//g, '-') : getTodayDate();

    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${useDate}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=8`);
        if (!response.ok) throw new Error(`Failed to fetch timings: ${response.status}`);
        const data = await response.json();

        const result = {
            timings: data.data.timings,
            date: {
                readable: data.data.date.readable,
                timestamp: data.data.date.timestamp,
                hijri: data.data.date.hijri,
                gregorian: data.data.date.gregorian
            },
            meta: data.data.meta
        };

        res.json({
            status: true,
            creator: config.author,
            result
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
