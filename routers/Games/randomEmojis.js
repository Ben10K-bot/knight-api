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
    message: "Missing query ?q=..."
  });
    }

    try {
        const url = `https://api.example.com/search?q=${q}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: response.data.result || response.data.data || response.data
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
