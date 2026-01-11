import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 기본 정보
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      // provider가 'local'일 때만 필수가 되도록 로직, DB 스키마에선 false
      required: false,
    },
    provider: {
      type: String,
      required: true,
      default: "local",
      enum: ["local", "google", "naver", "apple"],
    },
    snsId: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
      default: ""
    },

    // 권한 (나중에 관리자 페이지 만들 때 필요)
    role: {
      type: String,
      default: "user", // user, admin
      enum: ["user", "admin"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);