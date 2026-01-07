import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: { type: String, required: true },
    author: {
      id: String,
      nickname: String,
    },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    depth: { type: Number, default: 0 },
    path: { type: String }, // 검색 및 정렬용 경로
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// path와 postId로 자주 검색하므로 인덱스 설정
commentSchema.index({ postId: 1, path: 1 });

export default mongoose.model("Comment", commentSchema);