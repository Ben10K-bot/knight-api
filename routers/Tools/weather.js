import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { q } = req.query;

if (!q) {
  return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?q=city"
  });
}

  try {
    const url = `https://api.openweathermap.org/data/2.5/find?q=${q}&appid=5796abbde9106b7da4febfae8c44c232&units=metric`;

    const response = await axios.get(url, {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Origin': 'https://openweathermap.org',
        'Referer': 'https://openweathermap.org/',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: response.data.list
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
