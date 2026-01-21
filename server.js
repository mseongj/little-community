import dotenv from "dotenv";
dotenv.config(); // 설정 로드

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js"; // .js 필수!

// 모델 불러오기 (.js 필수!)
import User from './models/User.js';
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import authMiddleware from "./middleware/auth.js";

async function handleSocialLogin(res, userInfo) {
  try {
    const { email, nickname, profileImage, provider } = userInfo;

    // 1. DB 조회
    let user = await User.findOne({ email });

    // 2. 없으면 회원가입
    if (!user) {
      user = await User.create({
        email,
        nickname,
        profileImage,
        provider,
      });
    } else {
      // ⚠️ 이미 가입된 이메일인데, 다른 플랫폼으로 가입된 경우 체크 (선택사항)
      if (user.provider !== provider) {
        // 예를 들어 구글로 가입했는데 네이버로 또 로그인하면?
        // 그냥 넘어가도 되고, 에러를 띄워도 됩니다. 여기선 편의상 그냥 로그인 시킵니다.
      }
    }

    // 3. JWT 발급
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 4. 응답
    res.status(200).json({
      message: `${provider} 로그인 성공!`,
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "소셜 로그인 내부 처리 중 에러" });
  }
}

const app = express();

// DB 연결
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// --- API 엔드포인트 ---
// 게시글 조회
app.get(`/api/posts`, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const keyword = req.query.keyword || "";

    let searchCondition = {};
    if (keyword) {
      searchCondition = {
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // i: 대소문자 무시
          { content: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const totalPosts = await Post.countDocuments(searchCondition);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find(searchCondition)
      .sort({ createdAt: -1 })
      .select("title author createdAt views likes")
      .limit(limit)
      .skip(offset);

    res.json({
      posts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "에러 발생"})
  }
});
// 게시글 생성
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
// 게시글 수정 (PUT)
app.put("/api/posts/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "게시글이 없습니다." });

    // 🚨 보안 체크
    if (post.author.id.toString() !== req.user.userId) {
      return res.status(403).json({ error: "수정 권한이 없습니다." });
    }

    // 업데이트 진행
    post.title = title;
    post.content = content;
    // (선택) 수정된 날짜 갱신이 필요하면: post.updatedAt = Date.now();

    await post.save(); // 변경사항 저장

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "수정 실패" });
  }
});
// 게시글 삭제
app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "게시글이 없습니다." });
    }

    // 🚨 보안 체크: 요청한 사람(req.user.id)이 작성자(post.author)와 같은지 확인
    // DB의 ObjectId는 객체라서 문자열로 바꿔서(.toString) 비교해야 정확합니다.
    if (post.author.id.toString() !== req.user.userId) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // ✅ 뒤처리: 게시글에 달린 댓글들도 싹 다 지움 (Cascading Delete)
    await Comment.deleteMany({ postId: post._id });

    // 게시글 삭제
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "삭제 실패" });
  }
});
// 게시글 좋아요
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
// 상세 조회
app.get("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // views를 1 더해라
      { new: true } // 업데이트된 최신 데이터를 리턴해라 (안 쓰면 옛날 거 줌)
    )
    if (!post) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }
    const comments = await Comment.find({ postId: id}).sort({ createdAt: 1 });

    res.json({ post, comments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "상세 조회 실패" });
  }
});


// 회원 상세
app.put("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const { nickname, profileImage } = req.body;
    const userId = req.user.userId; // 토큰에서 뽑은 내 ID

    // 내 정보 찾아서 업데이트
    // { new: true } 옵션을 줘야 수정된 최신 정보를 리턴해줍니다.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname, profileImage },
      { new: true },
    ).select("-password"); // 비밀번호는 보안상 빼고 돌려줌

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "프로필 수정 실패" });
  }
});

// 댓글 쓰기
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


// 회원가입 로직

// Google로 로그인 하기
app.post("/api/auth/google", async (req, res) => {
  try {
    const userCode = req.body.code;
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;

    // 1. 구글 토큰 받기
    const reqBody = {
      code: userCode,
      client_id,
      client_secret,
      redirect_uri: "http://localhost:5173/auth/google/callback",
      grant_type: "authorization_code",
    };

    const GoogleToken = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    const tokenData = await GoogleToken.json();
    console.log(tokenData);
    
    if (tokenData.error) {
      console.error("구글 토큰 에러:", tokenData);
      return res.status(400).json({ error: "구글 로그인 실패" });
    }

    const accessToken = tokenData.access_token;

    // 2. 구글 유저 정보 받기
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const userInfo = await userInfoRes.json();

    const standardUser = {
      email: userInfo.email,
      nickname: userInfo.name,
      profileImage: userInfo.picture,
      provider: "google",
    };

    // 공통 함수 호출!
    await handleSocialLogin(res, standardUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google로 로그인에 실패 했습니다." });
  }
});

// Naver로 로그인 하기
app.post("/api/auth/naver", async (req, res) => {
  try {
    const { code, state } = req.body;
    const client_id = process.env.NAVER_CLIENT_ID;
    const client_secret = process.env.NAVER_CLIENT_SECRET;

    const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&state=${state}`;
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(400).json({ error: "네이버 토큰 발급 실패" });
    }

    const accessToken = tokenData.access_token;

    // 2. 유저 정보 요청
    const userInfoRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userInfoData = await userInfoRes.json();
    const userInfo = userInfoData.response;

    const standardUser = {
      email: userInfo.email,
      nickname: userInfo.name,
      profileImage: userInfo.profile_image,
      provider: "naver",
    };

    // 공통 함수 호출!
    await handleSocialLogin(res, standardUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google로 로그인에 실패 했습니다." });
  }
})

app.post("/api/auth/kakao", async (req, res) => {
  try {
    const { code } = req.body;
    const client_id = process.env.KAKAO_CLIENT_ID;
    const client_secret = process.env.KAKAO_CLIENT_SECRET;
    const redirect_uri = "http://localhost:5173/auth/kakao/callback"; // 프론트와 일치해야 함!

    const tokenUrl = `https://kauth.kakao.com/oauth/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code"); // 문자열 고정!
    params.append("client_id", client_id);
    params.append("redirect_uri", redirect_uri);
    params.append("code", code);
    params.append("client_secret", client_secret);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("카카오 토큰 에러:", tokenData);
      return res.status(400).json({ error: "카카오 토큰 발급 실패" });
    }

    const accessToken = tokenData.access_token;
    
    // 2. 유저 정보 요청
    const userInfoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const userInfoData = await userInfoRes.json();

    
    const kakaoAccount = userInfoData.kakao_account;
    const profile = kakaoAccount.profile;
    
    const standardUser = {
      email: kakaoAccount.email, // 이메일 제공 동의가 안 되어 있으면 없을 수 있음
      nickname: profile.nickname,
      profileImage: profile.profile_image_url, // 필드명이 profile_image_url 임
      provider: "kakao",
    };
    console.log("카카오 유저 정보:", standardUser);
    
    // 공통 함수 호출!
    await handleSocialLogin(res, standardUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kakao로 로그인에 실패 했습니다." });
  }
})



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 작동 중: http://localhost:${PORT}`);
});

