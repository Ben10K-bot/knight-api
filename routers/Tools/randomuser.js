import express from 'express';
import { config } from '../../config.js';

const router = express.Router();

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const chars = letters + numbers;

function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
}

router.get('/', (req, res) => {
    const { userlength } = req.query;

    let length = userlength ? Math.floor(Number(userlength)) : 8; 

    if (isNaN(length) || length < 1) length = 8;
    if (length > 50) length = 50;

    let user = '';
    for (let i = 0; i < length; i++) {
        user += getRandomChar();
    }

    return res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: user
    });
});

export default router;