import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../../config.js';

const router = express.Router();
const BASE_URL = 'https://natiga.nezakr.net';
const API_BASE = config.apiBaseUrl;

const AR_TO_EN = {
    'القاهرة': 'cairo',
    'الجيزة': 'giza',
    'الإسكندرية': 'alexandria',
    'الدقهلية': 'dakahlia',
    'الشرقية': 'sharqia',
    'الغربية': 'gharbia',
    'المنوفية': 'menoufia',
    'البحيرة': 'beheira',
    'كفر الشيخ': 'kafr-elsheikh',
    'الفيوم': 'fayoum',
    'بني سويف': 'beni-suef',
    'المنيا': 'minya',
    'أسيوط': 'assiut',
    'سوهاج': 'sohag',
    'قنا': 'qena',
    'الأقصر': 'luxor',
    'أسوان': 'aswan',
    'دمياط': 'damietta',
    'بورسعيد': 'portsaid',
    'الإسماعيلية': 'ismailia',
    'السويس': 'suez',
    'شمال سيناء': 'north-sinai',
    'جنوب سيناء': 'south-sinai',
    'مطروح': 'matrouh',
    'البحر الأحمر': 'red-sea',
    'الوادي الجديد': 'new-valley'
};

const EN_TO_AR = Object.fromEntries(
    Object.entries(AR_TO_EN).map(([ar, en]) => [en, ar])
);

router.get('/', async (req, res) => {
    try {
        const { data: html } = await axios.get(BASE_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        const $ = cheerio.load(html);
        const results = [];

        $('a').each((_, el) => {
            const text = $(el).text().trim();

            if (text.includes('نتيجة الشهادة الإعدادية محافظة')) {
                const match = text.match(/محافظة ([^\d]+) 2026/);
                let governorate = match ? match[1].trim() : '';
                governorate = governorate.replace('الترم الأول', '').trim();

                const status = text.includes('النتيجة متاحة الآن') ? 'ظهرت' : 'لم تظهر بعد';

                if (governorate && !results.some(r => r.name_ar === governorate)) {
                    results.push({
                        name_ar: governorate,
                        name_en: AR_TO_EN[governorate],
                        status,
                        endpoint: `${API_BASE}/api/Tools/natiga/${AR_TO_EN[governorate]}/`
                    });
                }
            }
        });

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            note: 'If your result is available, use: /governorate/seatNumber (example: /cairo/123456)',
            count: results.length,
            results
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: config.author || "dev.knight",
            error: err.message
        });
    }
});

router.get('/:governorate', async (req, res) => {
    const { governorate } = req.params;

    if (!Object.values(AR_TO_EN).includes(governorate)) {
        return res.status(404).json({
            status: false,
            creator: config.author || "dev.knight",
            message_ar: 'المحافظة غير مدعومة',
            message_en: 'Governorate not supported'
        });
    }

    const governorate_ar = EN_TO_AR[governorate];

    return res.json({
        status: false,
        creator: config.author || "dev.knight",
        message_ar: `عذراً، تأكد من كتابة رقم الجلوس للحصول على نتيجة محافظة ${governorate_ar}`,
        message_en: `Please make sure to enter the seat number to get the result of ${governorate} governorate`
    });
});

router.get('/:governorate/:seatNumber', async (req, res) => {
    const { governorate, seatNumber } = req.params;

    if (!/^\d{5,10}$/.test(seatNumber)) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message_ar: 'رقم الجلوس غير صحيح',
            message_en: 'Invalid seat number'
        });
    }

    if (!Object.values(AR_TO_EN).includes(governorate)) {
        return res.status(404).json({
            status: false,
            creator: config.author || "dev.knight",
            message_ar: 'المحافظة غير مدعومة',
            message_en: 'Governorate not supported'
        });
    }

    try {
        const studentUrl = `${BASE_URL}/${governorate}/num/${seatNumber}/`;
        const response = await axios.get(studentUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const seatBadge = $('span.seat-number-badge').text().trim();

        if (!seatBadge) {
            return res.status(404).json({
                status: false,
                creator: config.author || "dev.knight",
                message_ar: 'رقم الجلوس غير موجود أو لم يتم نشر النتيجة بعد',
                message_en: 'Seat number not found or the result is not published yet'
            });
        }

        const data = {
            name: $('h3').first().text().trim(),
            seat_number: seatBadge,
            governorate,
            total_score: $('h4 span').first().text().trim() || null,
            max_score: '140',
            rankings: []
        };

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result: data
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: config.author || "dev.knight",
            error: err.message
        });
    }
});

export default router;