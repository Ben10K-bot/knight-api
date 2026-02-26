import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

const BLACKBOX_CONFIG = {
    url: "https://www.blackbox.ai/api/chat",
    headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Content-Type": "application/json",
        "Origin": "https://www.blackbox.ai",
        "Referer": "https://www.blackbox.ai",
        "x-requested-with": "mark.via.gp"
    },
    bodyTemplate: {
        id: null,
        previewToken: null,
        userId: null,
        codeModelMode: true,
        trendingAgentMode: {},
        isMicMode: false,
        userSystemPrompt: null,
        maxTokens: null,
        playgroundTopP: null,
        playgroundTemperature: null,
        isChromeExt: false,
        githubToken: "",
        clickedAnswer2: false,
        clickedAnswer3: false,
        clickedForceWebSearch: false,
        visitFromDelta: false,
        isMemoryEnabled: false,
        mobileClient: false,
        userSelectedModel: null,
        userSelectedAgent: "VscodeAgent",
        validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
        imageGenerationMode: true,
        imageGenMode: "autoMode",
        webSearchModePrompt: true,
        deepSearchMode: true,
        promptSelection: "",
        domains: null,
        vscodeClient: false,
        codeInterpreterMode: false,
        customProfile: { name: "", occupation: "", traits: [], additionalInfo: "", enableNewChats: true },
        webSearchModeOption: { autoMode: true, webMode: true, offlineMode: true },
        session: null,
        isPremium: false,
        teamAccount: "",
        subscriptionCache: null,
        beastMode: true,
        reasoningMode: false,
        designerMode: true,
        workspaceId: "",
        asyncMode: false,
        integrations: {},
        isTaskPersistent: false,
        selectedElement: null
    }
};

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
        const requestBody = {
            ...BLACKBOX_CONFIG.bodyTemplate,
            messages: [{
                role: "user",
                content: q,
                id: null
            }]
        };

        const ass = axios.post;

        const response = await ass(BLACKBOX_CONFIG.url, requestBody, {
            headers: BLACKBOX_CONFIG.headers
        });

        const rawText = response.data;
        let finalMessage = rawText;

        const thinkMatch = rawText.match(/<think>(.*?)<\/think>/s);
        if (thinkMatch) {
            finalMessage = rawText.replace(thinkMatch[0], "").trim();
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: finalMessage
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            error: err.response?.data || err.message
        });
    }
});

export default router;