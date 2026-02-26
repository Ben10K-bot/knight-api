import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

const CHAT_CONFIG = {
    url: "https://chateverywhere.app",
    header: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'user-selected-plugin-id': '',
        'sec-ch-ua': '"Android WebView";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'user-browser-id': 'f723a968-6de3-4cfc-b1f0-aa7e5967e76a',
        'origin': 'https://chateverywhere.app',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://chateverywhere.app/',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i'
    }
};

router.get('/', async (req, res) => {
    const { q, prompt} = req.query;
    const model = "gpt-3.5-turbo";

    if (!q || !prompt) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?q=text or ?prompt=text"
  });
    }

    try {
        const initRes = await fetch(CHAT_CONFIG.url, {
            method: 'GET',
            headers: { 'User-Agent': CHAT_CONFIG.header['User-Agent'] }
        });

        const setCookieHeader = initRes.headers.get('set-cookie');
        let cookieString = "";
        if (setCookieHeader) {
            cookieString = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');
        }

        const bodyData = JSON.stringify({
            "model": {
                "id": model,
                "name": model === "gpt-3.5-turbo" ? "GPT-3.5" : model,
                "maxLength": 12000,
                "tokenLimit": 4000
            },
            "messages": [{ "pluginId": null, "content": q, "role": "user" }],
            "prompt": prompt,
            "temperature": 1,
            "enableConversationPrompt": false
        });

        const response = await fetch(`${CHAT_CONFIG.url}/api/chat`, {
            method: 'POST',
            headers: {
                ...CHAT_CONFIG.header,
                'Cookie': cookieString,
                'output-language': 'ar'
            },
            body: bodyData
        });

        const text = await response.text();
        
        if (!text) throw new Error("Empty response from API");

        let finalMessage = "";
        
        if (text.includes('data: ')) {
            const lines = text.trim().split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.substring(6);
                    if (dataStr === '[DONE]') continue;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices[0]?.delta?.content) {
                            finalMessage += data.choices[0].delta.content;
                        }
                    } catch (e) {}
                }
            }
        } else {
            finalMessage = text;
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: finalMessage.trim()
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