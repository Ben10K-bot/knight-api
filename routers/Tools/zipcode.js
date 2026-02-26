import express from 'express'; 
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { country, zip } = req.query;

    if (!country || !zip) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?country=us&zip=90210"
  });
    }

    try {
        const url = `http://api.zippopotam.us/${encodeURIComponent(country)}/${encodeURIComponent(zip)}`;

        const response = await axios.get(url, {
            timeout: 10000, 
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: response.data
        });

    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({
                status: false,
                creator: config.author,
                message: `ZIP code ${zip} not found in country ${country}`
            });
        }

        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;