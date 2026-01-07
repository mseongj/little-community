require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. CORS 불러오기
const connectDB = require('./config/db');

// 모델 불러오기
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const app = express();
connectDB();

app.use(cors()); // 2. 모든 요청 허용 (개발용)
app.use(express.json());

// --- API 엔드포인트 ---

// 가장 최근 게시글 1개와 그 댓글들을 가져오는 API
app.get('/api/posts/latest', async (req, res) => {
  try {
    // 1. 가장 최근 게시글 조회
    const post = await Post.findOne().sort({ createdAt: -1 });

    if (!post) {
      return res.status(404).json({ message: '게시글이 없습니다.' });
    }

    // 2. 해당 게시글의 댓글 조회 (핵심: path 기준으로 정렬!)
    const comments = await Comment.find({ postId: post._id })
      .sort({ path: 1 }) // 문자열 정렬 -> 트리 순서가 됨
      .lean(); // JSON으로 변환

    // 3. 응답 보내기
    res.json({
      status: 'success',
      data: {
        post: post,
        comments: comments
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버 작동 중: http://localhost:${PORT}`);
});