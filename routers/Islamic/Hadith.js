import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { edition, num } = req.query;

    try {
        if (!edition) {
            const response = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json');
            if (!response.ok) throw new Error(`Failed to fetch editions: ${response.status}`);
            const data = await response.json();

            return res.json({
                status: true,
                creator: config.author,
                message: "List of available editions, If you want it directly fetch a specific edition, use ?edition=edition_name",
                result: data
            });
        }

        let url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.json`;
        if (num) url += `/${num}.json`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch hadith: ${response.status}`);
        const data = await response.json();

        res.json({
            status: true,
            creator: config.author,
            edition,
            num: num || null,
            result: data
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
