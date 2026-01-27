import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 정규식 정의 (프론트와 통일)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/; // 8~20자, 영문+숫자
const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/; // 2~10자, 특수문자X

router.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 1. 공백 제거 및 필수 값 체크
    const trimmedEmail = email ? email.trim() : "";
    const trimmedPassword = password ? password.trim() : "";
    const trimmedNickname = nickname ? nickname.trim() : "";

    if (!trimmedEmail || !trimmedPassword || !trimmedNickname) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // 2. 유효성 검사 (정규식)
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "올바른 이메일 형식이 아닙니다." });
    }
    if (!passwordRegex.test(trimmedPassword)) {
      return res.status(400).json({
        error: "비밀번호는 8~20자이며, 영문과 숫자를 포함해야 합니다.",
      });
    }
    if (!nicknameRegex.test(trimmedNickname)) {
      return res.status(400).json({
        error: "닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.",
      });
    }

    // 3. 이메일 중복 검사
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    // 4. 닉네임 중복 검사 (선택 사항 - 필요하면 추가)
    // const existingNickname = await User.findOne({ nickname: trimmedNickname });
    // if (existingNickname) return res.status(409).json({ error: "이미 사용 중인 닉네임입니다." });

    // 5. 비밀번호 암호화 및 저장
    const hashedPassword = await argon2.hash(trimmedPassword);

    const newUser = new User({
      email: trimmedEmail,
      password: hashedPassword,
      nickname: trimmedNickname,
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
    if (!existingUser.password) {
      return res.status(400).json({
        error:
          "소셜(구글) 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.",
      });
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
      { expiresIn: "1h" },
    );

    // 4. 응답 (토큰과 유저 정보를 같이 보내주면 프론트에서 편함)
    res.status(200).json({
      message: "로그인 성공!",
      token: token,
      user: {
        id: existingUser._id,
        nickname: existingUser.nickname,
        email: existingUser.email,
        profileImage: existingUser.profileImage || "", // 프사 정보도 같이 주면 좋습니다!
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 에러 잠시 뒤에 다시 시도해 주세요" });
  }
});

export default router;
