import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 회원가입 API (POST /api/auth/signup)
router.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 1. 필수 입력값 검사
    if (!email || !password || !nickname) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // 2. 이메일 중복 검사
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    // 3. 비밀번호 암호화 (해싱) - 핵심!
    const hashedPassword = await argon2.hash(password);

    // 4. 유저 생성
    const newUser = new User({
      email,
      password: hashedPassword, // 암호화된 비밀번호 저장
      nickname,
      provider: "local",
    });

    await newUser.save();

    res.status(201).json({ message: "회원가입 성공!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 에러" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    // ⚠️ 중요: return을 꼭 써야 밑으로 안 내려갑니다.
    if (!existingUser) {
      return res.status(401).json({ error: "가입된 사용자가 아닙니다." });
    }

    // argon2.verify(DB에있는암호화된비번, 사용자가입력한쌩비번)
    const isMatch = await argon2.verify(existingUser.password, password);

    if (!isMatch) {
      return res.status(401).json({ error: "비밀번호가 틀렸습니다." });
    }

    // 3. 토큰 발급 (수정된 부분)
    // 변수에 담아서 클라이언트에게 보내줘야 합니다.
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      // "비밀키", // 나중엔 process.env.JWT_SECRET 으로 바꿀 예정
      { expiresIn: "1h" }
    );

    // 4. 응답 (토큰과 유저 정보를 같이 보내주면 프론트에서 편함)
    res.status(200).json({
      message: "로그인 성공!",
      token: token,
      user: {
        id: existingUser._id,
        nickname: existingUser.nickname,
        email: existingUser.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 에러 잠시 뒤에 다시 시도해 주세요" });
  }
})

export default router;