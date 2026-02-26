import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { country } = req.query;

    if (!country) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?country=country"
  });
    }

    try {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`;

        const response = await axios.get(url);

        const result = response.data;

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: {
            result
            }
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
