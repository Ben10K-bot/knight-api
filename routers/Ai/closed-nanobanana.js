import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { config } from '../../config.js';
import { loadImageFromUrl, encrypt  } from '../../server.js'

const router = express.Router();

function genserial() {
  let s = '';
  for (let i = 0; i < 32; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

async function uploadImageToCDN(imageUrl) {
  const buffer = await loadImageFromUrl(imageUrl);
  const ext = path.extname(imageUrl).replace('.', '') || 'jpg';
  const filename = `img_${Date.now()}.${ext}`;

  const form = new FormData();
  form.append('file_name', filename);

  const uploadRes = await axios.post(
    'https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    { headers: form.getHeaders() }
  );

  const uploadInfo = uploadRes.data.result;
  await axios.put(uploadInfo.url, buffer, {
    headers: {
      'Content-Type': `image/${ext}`,
      'Content-Length': buffer.length
    },
    maxBodyLength: Infinity
  });

  return 'https://cdn.imgupscaler.ai/' + uploadInfo.object_name;
}

async function createJob(imageUrl, prompt) {
  let finalUrl = imageUrl;

  if (!imageUrl.includes('cdn.imgupscaler.ai') && !imageUrl.includes('pbs0.iuimg.com')) {
    finalUrl = await uploadImageToCDN(imageUrl);
  }

  const form = new FormData();
  form.append('model_name', 'magiceraser_v4');
  form.append('prompt', prompt);
  form.append('ratio', 'match_input_image');
  form.append('output_format', 'jpg');
  form.append('original_image_url', finalUrl);

  const res = await axios.post(
    'https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job',
    form,
    {
      headers: {
        ...form.getHeaders(),
        accept: '*/*',
        'accept-language': 'en-SA,en;q=0.9,ar-SA;q=0.8,ar;q=0.7,en-GB;q=0.6,en-US;q=0.5',
        authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzA5ODY4MywicHJvdmlkZXIiOiJnb29nbGUiLCJlbWFpbCI6InhnMzQxMTIzQGdtYWlsLmNvbSIsIm9wZW5faWQiOiIifQ.qso2Wu5EPsgN6QVdY40rnyUiXioZ-tMu3piAgLFxchM',
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/',
        'product-code': 'magiceraser',
        'product-serial': genserial(),
        priority: 'u=1, i',
        timezone: 'Asia/Riyadh',
        'sec-ch-ua': `"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': `"Windows"`,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36'
      },
      maxBodyLength: Infinity
    }
  );

  const jobId = res.data?.result?.job_id;
  if (!jobId) throw new Error('Failed to create job');

  return jobId;
}

async function checkJob(jobId) {
  const headers = {
    origin: 'https://imgupscaler.ai',
    referer: 'https://imgupscaler.ai/'
  };
  const res = await axios.get(
    `https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    { headers }
  );
  return res.data;
}

router.get('/', async (req, res) => {
  const { image, prompt, key } = req.query
  const encryptedKey = "00000000000000000000000000000000:2ea7ac229dfd98da616e0547a66105111853b712051a3e62e52414d825f6a2e6";


  if (!image || !prompt || !key) {
    return res.status(400).json({
      status: false,
      creator: config.author,
      message: "Missing parameters ?image=url&prompt=text&key=key"
    })
  }

    if (encrypt(key) !== encryptedKey) {
    return res.status(400).json({
        status: false,
        creator: config.author || "dev.knight",
        message: "your key is wrong, if you don't have one contact the owner"
    });
  }

  try {
    const jobId = await createJob(image, prompt);

    let result;
    let attempts = 0;

    do {
      await new Promise(r => setTimeout(r, 3000));
      result = await checkJob(jobId);
      attempts++;
      if (attempts > 40) throw new Error('Timeout waiting for generation');
    } while (result?.code === 300006);

    const finalImageUrl = result?.result?.output_url?.[0];
    if (!finalImageUrl) throw new Error('Image generation failed');

    const imgRes = await axios.get(finalImageUrl, { responseType: 'arraybuffer' });
    const imgBuffer = Buffer.from(imgRes.data);

    res.set('Content-Type', imgRes.headers['content-type'] || 'image/png');
    res.send(imgBuffer);
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: config.author || 'dev.knight',
      error: err.message
    });
  }
});

export default router;
