// routes/upload.js
import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 1. S3 클라이언트 설정 (로그인)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 2. Multer 설정 (파일을 받아서 S3로 토스하는 역할)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // 파일 타입 자동 감지
    key: function (req, file, cb) {
      // 파일 이름 겹치지 않게: 현재시간_원래이름
      const folderPath = "posts/";
      cb(null, `${folderPath}${Date.now()}_${file.originalname}`);
    },
  }),
});

// 3. 업로드 API (POST /api/upload)
// 'image'라는 이름으로 파일을 보낼 겁니다.
router.post("/", upload.single("image"), (req, res) => {
  try {
    const originalUrl = req.file.location;
    const fileKey = req.file.key;
    // 업로드 성공하면 S3에 저장된 주소(location)를 줍니다.
    // CDN 도메인이 설정되어 있으면 교체, 없으면 그냥 S3 주소 사용
    const finalUrl = process.env.AWS_CLOUDFRONT_DOMAIN
      ? `${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}`
      : originalUrl;

    console.log("변환된 URL:", finalUrl);
    res.json({ url: finalUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "업로드 실패" });
  }
});

export default router;
