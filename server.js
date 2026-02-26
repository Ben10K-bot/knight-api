import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs, { stat } from 'fs';
import os from 'os';
import fetch from 'node-fetch';
import { config } from './config.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

function getCategoryDescription(categoryName) {
  const descriptions = {
    Ai: 'AI and Machine Learning APIs',
    Download: 'Media Download Services',
    Games: 'Gaming APIs',
    Image: 'Image Processing',
    Islamic: 'Islamic Content APIs',
    Search: 'Search Services',
    Tools: 'Utility Tools',
    VoiceAi: 'Voice and Audio AI',
  };
  return descriptions[categoryName] || `${categoryName} APIs`;
}

function detectHttpMethod(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('.post(')) return 'POST';
  if (content.includes('.put(')) return 'PUT';
  if (content.includes('.delete(')) return 'DELETE';
  if (content.includes('.patch(')) return 'PATCH';
  return 'GET';
}

app.get('/api/categories', (req, res) => {
  const routersPath = path.join(__dirname, 'routers');
  if (!fs.existsSync(routersPath)) return res.json([]);
  
  const items = fs.readdirSync(routersPath, { withFileTypes: true });
  const categories = items
    .filter(item => item.isDirectory())
    .map(item => ({
      name: item.name,
      description: getCategoryDescription(item.name)
    }));
  res.json(categories);
});

app.get('/api/endpoints/:category', (req, res) => {
  const { category } = req.params;
  const categoryPath = path.join(__dirname, 'routers', category);

  if (!fs.existsSync(categoryPath)) return res.json([]);

  const files = fs.readdirSync(categoryPath);

  const detectQueryParams = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');

    const params = new Set();

    const regex1 = /req\.query\.([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = regex1.exec(content)) !== null) {
      params.add(match[1].trim());
    }

    const regex2 = /const\s*{\s*([^}]+)\s*}\s*=\s*req\.query/g;
    while ((match = regex2.exec(content)) !== null) {
      match[1].split(',').forEach(p => params.add(p.trim()));
    }

    return Array.from(params);
  };

  const endpoints = files
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const apiName = file.replace('.js', '');
      const title = apiName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const filePath = path.join(categoryPath, file);
      const method = detectHttpMethod(filePath);

      const queryParams = detectQueryParams(filePath);

      return {
        title,
        path: `/${apiName}`,
        method: method,
        category: category,
        query: queryParams
      };
    });

  res.json(endpoints);
});


app.get('/api/server-info', (req, res) => {
  const routersPath = path.join(__dirname, 'routers');
  let totalApis = 0;
  let categoriesCount = 0;

  if (fs.existsSync(routersPath)) {
    const categories = fs.readdirSync(routersPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    categoriesCount = categories.length;
    
    categories.forEach(cat => {
      const catPath = path.join(routersPath, cat.name);
      const apis = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
      totalApis += apis.length; 
    });
  }

  const sysUptime = os.uptime();
  const processUptime = process.uptime();
  const loadAverage = os.loadavg();
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const processMem = process.memoryUsage();

  const cpuLoad1 = Array.isArray(loadAverage) && loadAverage.length ? loadAverage[0] : 0;
  const cpuUsagePercent = cpus.length
    ? Math.max(0, Math.min(100, Math.round((cpuLoad1 / cpus.length) * 100)))
    : null;

  const memoryUsagePercent = totalMemory
    ? Math.round(((totalMemory - freeMemory) / totalMemory) * 100)
    : null;

  res.json({
    status: 'Online',
    uptime: sysUptime,
    processUptime,
    platform: os.platform(),
    osRelease: os.release(),
    arch: os.arch(),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Unknown',
    loadAverage,
    cpuUsagePercent,
    nodeVersion: process.version,
    memoryUsage: {
      totalMemory,
      freeMemory,
      usedMemory: totalMemory - freeMemory,
      rss: processMem.rss,
      heapTotal: processMem.heapTotal,
      heapUsed: processMem.heapUsed,
      external: processMem.external,
      arrayBuffers: processMem.arrayBuffers
    },
    memoryUsagePercent,
    totalApis,
    categoriesCount,
    author: config.author || '𝓭𝓮𝓿.𝓴𝓷𝓲𝓰𝓱𝓽'
  });
});

app.get('/api/allApi', (req, res) => {
  const routersPath = path.join(__dirname, 'routers');
  const allEndpoints = [];
  
  if (fs.existsSync(routersPath)) {
    const categories = fs.readdirSync(routersPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    categories.forEach(cat => {
      const catPath = path.join(routersPath, cat.name);
      const files = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
      
      files.forEach(file => {
        const apiName = file.replace('.js', '');
        const filePath = path.join(catPath, file);
        const method = detectHttpMethod(filePath);
        
        allEndpoints.push({
          category: cat.name,
          endpoint: apiName,
          path: `/api/${cat.name}/${apiName}`,
          method: method
        });
      });
    });
  }
  
  res.json({
    total: allEndpoints.length,
    endpoints: allEndpoints
  });
});

app.get('/api/allApi/', (req, res) => {
  res.redirect('/api/allApi');
});

const routerCache = new Map();

app.use('/api/:category/:endpoint', async (req, res, next) => {
    try {
        const { category, endpoint } = req.params;
        const routerPath = path.join(__dirname, 'routers', category, `${endpoint}.js`);
        const cacheKey = `${category}/${endpoint}`;

        if (!fs.existsSync(routerPath)) {
            return res.status(404).json({
              status: false,
              creator: config.author || "dev.knight",
              error: 'Endpoint Not Found',
              category: category,
              endpoint: endpoint,
              message: `The endpoint /api/${category}/${endpoint} does not exist`,
              availableEndpoints: '/api/allApi'
            });
        }

        let router;
        if (routerCache.has(cacheKey)) {
            router = routerCache.get(cacheKey);
        } else {
            const routerModule = await import(pathToFileURL(routerPath).href);
            router = routerModule.default;
            routerCache.set(cacheKey, router);
        }

        if (!router) {
            return res.status(500).json({
              status: false,
              creator: config.author || "dev.knight",
              error: 'Invalid router export'
            });
        }

        const subApp = express();
        subApp.use(express.json());
        subApp.use('/', router);

        const basePath = `/api/${category}/${endpoint}`;
        const originalUrl = req.url;
        req.url = originalUrl.replace(basePath, '') || '/';

        subApp(req, res);
        req.url = originalUrl; 
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({
          status: false,
          creator: config.author || "dev.knight",
          error: error.message
        });
    }
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'info.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Privacy&Policy.html'));
});

const users = [
  {
    name: "Mohamed_A",
    phone: "0547540321"
  }
];

app.post("/get-key", (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).sendFile(
      path.join(__dirname, "public", "404.html")
    );
  }

  const user = users.find(
    u =>
      u.name === name.trim() &&
      u.phone === phone.trim()
  );

  if (!user) {
    return res.status(403).sendFile(
      path.join(__dirname, "public", "info.html")
    );
  }

  const key = "SondosElsharmota125KnightApi";

  return res.json({
    success: true,
    key: key
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  
  if (req.accepts('html')) {
    const errorPage = status === 404 ? '404.html' : '500.html';
    res.status(status).sendFile(path.join(__dirname, 'public', errorPage));
  } else {
    res.status(status).json({
      error: status === 404 ? 'Not Found' : 'Internal Server Error',
      message: err.message,
      status: status
    });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: false,
      creator: config.author || "dev.knight",
      error: 'API Endpoint Not Found',
      path: req.path,
      message: 'The requested API endpoint does not exist',
      availableEndpoints: '/api/allApi'
    });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

export function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

export async function loadImageFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error(`❌ Error loading image from ${url}:`, error.message);
        return null;
    }
}

const SECRET_KEY = crypto.createHash('sha256').update("SHA521KnightAPI").digest();

export function decrypt(text) {
    const parts = text.split(":");

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET_KEY),
        iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

const FIXED_IV = Buffer.alloc(16, 0);

export function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    SECRET_KEY,
    FIXED_IV
  );

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  return FIXED_IV.toString("hex") + ":" +
         encrypted.toString("hex");
}

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

export async function chatEverywhere(
    q,
    model = "gpt-3.5-turbo",
    prompt
) {
    if (!q) throw new Error("Missing query ?q=text");

    const initRes = await fetch(CHAT_CONFIG.url, {
        method: 'GET',
        headers: { 'User-Agent': CHAT_CONFIG.header['User-Agent'] }
    });

    const setCookieHeader = initRes.headers.get('set-cookie');
    let cookieString = "";

    if (setCookieHeader) {
        cookieString = setCookieHeader
            .split(',')
            .map(c => c.split(';')[0])
            .join('; ');
    }

    const bodyData = JSON.stringify({
        model: {
            id: model,
            name: model === "gpt-3.5-turbo" ? "GPT-3.5" : model,
            maxLength: 12000,
            tokenLimit: 4000
        },
        messages: [{ pluginId: null, content: q, role: "user" }],
        prompt,
        temperature: 1,
        enableConversationPrompt: false
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
                    if (data.choices?.[0]?.delta?.content) {
                        finalMessage += data.choices[0].delta.content;
                    }
                } catch {}
            }
        }
    } else {
        finalMessage = text;
    }

    return finalMessage.trim();
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});