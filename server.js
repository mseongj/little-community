import dotenv from "dotenv";
dotenv.config(); // 설정 로드

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // .js 필수!

// 모델 불러오기 (.js 필수!)
import User from './models/User.js';
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/auth.js";

const app = express();

// DB 연결
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

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

app.post("/api/posts", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    
    const post = await Post.create({
      title,
      content,
      author: {
        id: user._id,
        nickname: user.nickname,
      },
    });

    console.log(`✅ 게시글 생성: ${post.title} by ${user.nickname}`);
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "게시글을 생성하지 못했습니다." });
  }
});

app.post("/api/comments", authMiddleware, async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: "부모 댓글을 찾을 수 없습니다." });
      }
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const depth = parentComment ? parentComment.depth + 1 : 0;

    const newComment = new Comment({
      postId,
      content,
      author: {
        id: user._id,
        nickname: user.nickname
      },
      parentCommentId: parentCommentId || null,
      depth,
    });

    // 3. Path 계산 및 업데이트
    let newPath = newComment._id.toString();
    if (parentComment) {
      newPath = `${parentComment.path},${newComment._id}`;
    }

    newComment.path = newPath;
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "댓글 저장 실패" });
  }
});

app.put("/api/posts/:id/like", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "게시글이 삭제 되었습니다." });
    }

    // 1. 이미 추천을 눌렀는지 확인 (배열 안에 내 ID가 있는가?)
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // 2-1. 이미 눌렀으면 -> 취소 (배열에서 제거)
      // filter를 써서 내 ID만 뺀 나머지로 다시 채움
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      // 2-2. 안 눌렀으면 -> 추가 (배열에 넣기)
      post.likes.push(userId);
    }

    await post.save();

    // 3. 변경된 좋아요 수와 상태를 응답
    res.json({
      likesCount: post.likes.length,
      isLiked: !isLiked, // 현재 상태 (눌렀으면 true, 취소했으면 false)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "추천 처리 실패" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 작동 중: http://localhost:${PORT}`);
});

