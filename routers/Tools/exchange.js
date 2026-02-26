import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query parameters ?from=USD&to=EUR&amount=10"
  });
  }

  try {
    const url = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const response = await axios.get(url);

    res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: {
        amount: parseFloat(amount),
        from: from.toUpperCase(),
        to: to.toUpperCase().split(','),
        converted: response.data.rates,
        date: response.data.date
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