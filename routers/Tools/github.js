import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?username=githubusername"
  });
    }

    try {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}`;

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
