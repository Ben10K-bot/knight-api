import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { ids, currency } = req.query;
    const cryptoIds = ids ;
    const curr = currency;

    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cryptoIds)}&vs_currencies=${encodeURIComponent(curr)}`;

        const response = await axios.get(url, {
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
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;
