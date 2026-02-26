import fetch from 'node-fetch';
import { config } from '../../config.js';
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.method === 'GET' ? req.query.url : req.body.url;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "الرجاء توفير رابط Google Drive في الباراميتر url"
        });
    }

    if (!/drive\.google\.com\/file/i.test(url)) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "الرابط المقدم غير صالح"
        });
    }

    try {
        const fileDetails = await fdrivedl(url);
        const fileSize = formatBytes(fileDetails.sizeBytes);

        if (fileSize.includes('GB') && parseFloat(fileSize) > 1.9) {
            return res.status(400).json({
                creator: config.author || "dev.knight",
                message: "الملف كبير جدا"
            });
        }

        return res.json({
            status: true,
            creator: config.author || "dev.knight",
            message: {
                fileName: fileDetails.fileName,
                size: fileSize,
                mimetype: fileDetails.mimetype,
            },
            data: {
                downloadUrl: fileDetails.downloadUrl
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        status: false,
            creator: config.author || "dev.knight",
            message: "فشل الاتصال بسيرفر التحميل",
            error: error.message
        });
    }
});

async function fdrivedl(url) {
    const idMatch =
        url.match(/\/file\/d\/([^/?]+)/) ||
        url.match(/\/d\/([^/?]+)/) ||
        url.match(/[?&]id=([^&]+)/);

    if (!idMatch) throw new Error("رقم الملف غير موجود في الرابط");

    const id = idMatch[1];

    const downloadUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download`;

    const head = await fetch(downloadUrl, { method: 'HEAD' });

    if (!head.ok) throw new Error("الملف غير متاح أو غير Public");

    const sizeBytes = parseInt(head.headers.get('content-length')) || 0;

    const disposition = head.headers.get('content-disposition');
    let fileName = "unknown";

    if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?(.+?)["';]?$/i);
        if (match) {
            let rawName = match[1];
            try {
                const buf = Buffer.from(rawName, 'latin1');
                fileName = buf.toString('utf8');
            } catch {
                fileName = rawName;
            }
        }
    }

    return {
        downloadUrl,
        fileName,
        sizeBytes,
        mimetype: head.headers.get('content-type') || 'unknown'
    };
}
function formatBytes(bytes, decimals = 2) {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default router;