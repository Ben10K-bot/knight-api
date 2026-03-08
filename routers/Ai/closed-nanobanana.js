import express from 'express'
import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import { loadImageFromUrl, encrypt  } from '../../server.js'
import { config } from '../../config.js'

const router = express.Router()

const headers = {
  origin: 'https://imgupscaler.ai',
  referer: 'https://imgupscaler.ai/'
}

function genserial() {
  let s = ''
  for (let i = 0; i < 32; i++) {
    s += Math.floor(Math.random() * 16).toString(16)
  }
  return s
}

async function getUploadInfo(filename) {
  const form = new FormData()
  form.append('file_name', filename)

  const res = await axios.post(
    'https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    {
      headers: {
        ...form.getHeaders(),
        ...headers
      }
    }
  )

  return res.data.result
}

async function uploadImage(imageUrl) {

  const buffer = await loadImageFromUrl(imageUrl)
  if (!buffer) throw new Error('Failed to load image')

  const ext = path.extname(imageUrl).replace('.', '') || 'jpg'
  const filename = `img_${Date.now()}.${ext}`

  const uploadInfo = await getUploadInfo(filename)

  await axios.put(uploadInfo.url, buffer, {
    headers: {
      'Content-Type': `image/${ext}`,
      'Content-Length': buffer.length
    },
    maxBodyLength: Infinity
  })

  return 'https://cdn.imgupscaler.ai/' + uploadInfo.object_name
}

async function createJob(imageUrl, prompt) {

  const form = new FormData()

  form.append('model_name', 'magiceraser_v4')
  form.append('original_image_url', imageUrl)
  form.append('prompt', prompt)
  form.append('ratio', 'match_input_image')
  form.append('output_format', 'jpg')

  const res = await axios.post(
    'https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job',
    form,
    {
      headers: {
        ...form.getHeaders(),
        ...headers,
        'product-code': 'magiceraser',
        'product-serial': genserial()
      }
    }
  )

  const jobId = res.data?.result?.job_id
  if (!jobId) throw new Error('Failed to create job')

  return jobId
}

async function checkJob(jobId) {

  const res = await axios.get(
    `https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    { headers }
  )

  return res.data
}

const encryptedKey = "00000000000000000000000000000000:2ea7ac229dfd98da616e0547a66105111853b712051a3e62e52414d825f6a2e6";

router.get('/', async (req, res) => {

  const { image, prompt, key } = req.query

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

    const cdnImage = await uploadImage(image)

    const jobId = await createJob(cdnImage, prompt)

    let result
    let attempts = 0

    do {
      await new Promise(r => setTimeout(r, 3000))
      result = await checkJob(jobId)
      attempts++

      if (attempts > 40) throw new Error('Timeout waiting for generation')

    } while (result.code === 300006)

    const outputUrl = result?.result?.output_url?.[0]
    if (!outputUrl) throw new Error('Image generation failed')

    const img = await axios.get(outputUrl, {
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(img.data)

    res.set({
      'Content-Type': img.headers['content-type'] || 'image/png'
    })

    res.send(buffer)

  } catch (err) {

    res.status(500).json({
      status: false,
      creator: config.author,
      error: err.message
    })

  }

})

export default router