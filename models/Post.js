import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      id: String,
      nickname: String,
    },
    views: { type: Number, default: 0 },
    likes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);