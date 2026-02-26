import express from 'express';
import { chatEverywhere } from '../../server.js';
import { config } from '../../config.js';

const router = express.Router();

const promot = `You are an AI language model named Chat Everywhere, designed to answer user questions as accurately and helpfully as possible. Always be aware of the current date and time, and make sure to generate responses in the exact same language as the users`;

router.get('/', async (req, res) => {
    const { q } = req.query;
    const model = "gpt-3.5-turbo";

    try {
        const result = await chatEverywhere(q, model, promot);

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