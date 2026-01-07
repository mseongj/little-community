import dotenv from "dotenv";
dotenv.config(); // 설정 로드

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // .js 필수!

// 모델 불러오기 (.js 필수!)
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";

const app = express();

// DB 연결
connectDB();

app.use(cors());
app.use(express.json());

// --- API 엔드포인트 ---

// 1. 게시글 목록 조회
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select("title author createdAt views");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "에러 발생" });
  }
});

// 2. 상세 조회
app.get("/api/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const comments = await Comment.find({ postId }).sort({ path: 1 }).lean();

    res.json({ post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "에러 발생" });
  }
});

app.post("/api/posts", async (req, res) =>{
  try{
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
    }
    const author = { id: "admin", nickname: "관리자" }; // 임시 하드코딩.

    const post = await Post.create({
      title,
      content,
      author,
    });

    console.log("✅ 게시글 생성 완료:", post.title);
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "게시글을 생성하지 못했습니다."});
  }
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 작동 중: http://localhost:${PORT}`);
});
