import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import { loadImageFromUrl } from '../../server.js';
import { config } from '../../config.js';

const router = express.Router();

const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`;

let cacheThemeVersion = null;

const baseHeaders = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': 'application/json, text/plain, */*',
  'origin': 'https://aifaceswap.io',
  'referer': 'https://aifaceswap.io/nano-banana-ai/'
};

async function getThemeVersion() {
  if (cacheThemeVersion) return cacheThemeVersion;

  try {
    const html = await (await fetch('https://aifaceswap.io/nano-banana-ai/')).text();
    const jsMatch = html.match(/src="([^"]*aifaceswap_nano_banana[^"]*\.js)"/);
    if (!jsMatch) throw new Error();

    const jsUrl = jsMatch[1].startsWith('http')
      ? jsMatch[1]
      : `https://aifaceswap.io${jsMatch[1]}`;

    const jsText = await (await fetch(jsUrl)).text();
    const themeMatch = jsText.match(/headers\["theme-version"\]="([^"]+)"/);

    cacheThemeVersion = themeMatch
      ? themeMatch[1]
      : 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM';

    return cacheThemeVersion;
  } catch {
    return 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM';
  }
}

async function genSigs() {
  const fp = crypto.randomUUID();
  const themeVersion = await getThemeVersion();
  const aesSecret = crypto.randomBytes(8).toString('hex');

  const xGuide = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(aesSecret)
  ).toString('base64');

  const cipher = crypto.createCipheriv(
    'aes-128-cbc',
    Buffer.from(aesSecret),
    Buffer.from(aesSecret)
  );

  let fp1 = cipher.update('aifaceswap:' + fp, 'utf8', 'base64');
  fp1 += cipher.final('base64');

  return {
    fp,
    fp1,
    'x-guide': xGuide,
    'x-code': Date.now().toString(),
    'theme-version': themeVersion
  };
}

async function uploadImage(imageUrl) {
  const buffer = await loadImageFromUrl(imageUrl);
  if (!buffer) throw new Error('Failed to load image');

  const ext = path.extname(imageUrl).replace('.', '') || 'jpg';
  const filename = crypto.randomUUID().replace(/-/g, '') + '.' + ext;
  const sigs = await genSigs();

  const res = await fetch('https://aifaceswap.io/api/upload_file', {
    method: 'POST',
    headers: { ...baseHeaders, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: filename,
      type: 'image',
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  });

  const data = await res.json();
  const putUrl = data?.data?.url;
  if (!putUrl) throw new Error('Upload URL not received');

  await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': `image/${ext}` },
    body: buffer
  });

  return putUrl.split('?')[0].split('.aliyuncs.com/')[1];
}

async function createJob(prompt, imgKey = null) {
  const sigs = await genSigs();

  const body = {
    fn_name: 'demo-nano-banana',
    call_type: 1,
    input: {
      prompt,
      scene: 'standard',
      resolution: '1K',
      aspect_ratio: 'auto'
    },
    consume_type: 0,
    request_from: 1,
    origin_from: '4b06e7fa483b761a'
  };

  if (imgKey) {
    body.input.source_images = [imgKey];
  }

  const res = await fetch('https://aifaceswap.io/api/aikit/create', {
    method: 'POST',
    headers: { ...baseHeaders, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const jobId = data?.data?.task_id;
  if (!jobId) throw new Error('Failed to create job');

  return jobId;
}

async function checkJob(jobId) {
  const sigs = await genSigs();

  const res = await fetch('https://aifaceswap.io/api/aikit/check_status', {
    method: 'POST',
    headers: { ...baseHeaders, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: jobId,
      fn_name: 'demo-nano-banana',
      call_type: 1,
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  });

  const data = await res.json();
  return data?.data;
}

router.get('/', async (req, res) => {
  const { image, prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({
      status: false,
      creator: config.author || "dev.knight",
      message: 'Missing parameter: prompt'
    });
  }

  try {
    let imgKey = null;

    if (image) {
      imgKey = await uploadImage(image);
    }

    const jobId = await createJob(prompt, imgKey);

    let result;
    let attempts = 0;

    do {
      await new Promise(r => setTimeout(r, 3000));
      result = await checkJob(jobId);
      attempts++;
      if (attempts > 40) throw new Error('Timeout waiting for generation');
    } while (result && (result.status === 0 || result.status === 1));

    const finalImageUrl = result?.result_image;
    if (!finalImageUrl) throw new Error('Image generation failed');

    const imgRes = await fetch(finalImageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    res.set('Content-Type', imgRes.headers.get('content-type') || 'image/png');
    res.send(imgBuffer);

  } catch (err) {
    res.status(500).json({
      status: false,
      creator: config.author || "dev.knight",
      error: err.message
    });
  }
});

export default router;