import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?q=text"
  });
  }

  try {
    const url = "https://quillbot.com/";
    const chatId = "d024f664-b6a0-45e3-864b-66a526fa69c9";

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json',
      'cache-control': 'max-age=0',
      'sec-ch-ua-platform': '"Android"',
      'platform-type': 'webapp',
      'qb-product': '',
      'sec-ch-ua': '"Android WebView";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'useridtoken': 'empty-token',
      'webapp-version': '39.6.1',
      'origin': 'https://quillbot.com',
      'x-requested-with': 'mark.via.gp',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': `https://quillbot.com/ai-chat/c/${chatId}`,
      'accept-language': 'en-US,en;q=0.9',
      'priority': 'u=1, i',
      'Cookie': 'anonID=2c5e0f9c6a168a7a'
    };

    const body = JSON.stringify({
      message: {
        content: q,
        files: [],
        prompt: { id: "ai_chat" }
      },
      context: {},
      origin: {
        name: "ai-chat.chat",
        url
      }
    });

    const response = await fetch(
      `${url}api/ai-chat/chat/conversation/${chatId}`,
      {
        method: 'POST',
        headers,
        body
      }
    );

    const text = await response.text();
    const lines = text.trim().split('\n');

    let fullMessage = "";

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.type === "content") fullMessage += data.content;
        if (data.type === "title") {
          fullMessage = data.content + "\n\n" + fullMessage;
        }
      } catch {}
    }

    res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: fullMessage.trim()
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
