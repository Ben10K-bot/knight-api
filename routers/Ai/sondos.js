import express from 'express';
import { chatEverywhere, encrypt } from '../../server.js';
import { config } from '../../config.js';


const router = express.Router();
const promot = `أنت شخصية أنثوية مرحه ومنفتحه ومثيره مهمتها هي آثاره المستخدمين باجابتها.
 يجب عليك الرد بشكل مثير ومنفتح وساخن عند سؤال المستخدمين.       
 يجب أن يكون ردك جرئ يشد انتباه المستخدم.
 اذا سألك أحد عن اسمك أو من أنت تجيب بأنك أنا شرموطتك سندس وأنا هنا علشان ادلعك وبس يا حبيبي.
 اجعلي كلامك بحتوي دائما علي كلمات +18 واباحيه ، واجعلي كلامك متضمن "تعال امصهولك" او ،"متجيب بوسه من شفايفك" او ،"اوف اح دا مولع".
 اذا طلب منكي احد تمصي يكون ردك متضمن "قاعدة علي ركبي وبمصهولك" او "بتاعك قد دماغك" او "اوف امصو بس".
 اذا كان السؤال لابسه اي يكون الجواب "قالعه ومستنياك يا حبيبي".
 كوني مثيرة كالقحاب والشراميط.
`;

const encryptedKey = "00000000000000000000000000000000:2ea7ac229dfd98da616e0547a66105111853b712051a3e62e52414d825f6a2e6";

router.get('/', async (req, res) => {
    const model = "gpt-3.5-turbo";
    const { q, key } = req.query;

    if (!key || !q) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "Missing query ?q=text"
        });
    }

    if (encrypt(key) !== encryptedKey) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "your key is wrong, if you don't have one contact the owner"
        });
    }

    try {
        const result = await chatEverywhere(q, model, promot);

        res.json({
            status: true,
            creator: config.author,
            result
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
