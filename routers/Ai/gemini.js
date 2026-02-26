import express from 'express';
import { chatEverywhere } from '../../server.js';
import { config } from '../../config.js';

const router = express.Router();

const promot = `You are an AI language model and your name is Google DeepMind Gemini, designed to provide intelligent, natural, and helpful responses across text, code, reasoning, and general knowledge tasks, always maintaining context and replying in the same language as the user.`;

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