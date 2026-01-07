// seed.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const seedData = async () => {
  try {
    await connectDB(); // DB 연결

    // 1. 기존 데이터 초기화 (깨끗하게 시작)
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log("🗑️  기존 데이터 삭제 완료");

    // 2. 게시글 생성
    const post = await Post.create({
      title: "MongoDB 대댓글 구현 예제입니다",
      content: "시딩 스크립트로 데이터를 넣으니 정말 편하네요!",
      author: { id: "admin", nickname: "관리자" },
    });
    console.log("✅ 게시글 생성 완료:", post.title);

    // 3. 댓글 생성 함수 (복잡한 path 계산을 자동화)
    // parent: 부모 댓글 객체 (없으면 null)
    const createComment = async (content, nickname, parent = null) => {
      // depth 계산
      const depth = parent ? parent.depth + 1 : 0;

      // 일단 저장 (ID 생성을 위해)
      const comment = new Comment({
        postId: post._id,
        content,
        author: { id: "user", nickname },
        parentCommentId: parent ? parent._id : null,
        depth,
      });
      await comment.save();

      // path 업데이트 (부모path + , + 내ID)
      // 부모가 없으면 내 ID가 path가 됨
      let newPath = comment._id.toString();
      if (parent) {
        newPath = `${parent.path},${comment._id}`;
      }

      comment.path = newPath;
      await comment.save();

      return comment;
    };

    // 4. 계층형 댓글 데이터 넣기
    // (1) 최상위 댓글 A
    const comment1 = await createComment(
      "1등! 좋은 정보 감사합니다.",
      "개발자1"
    );

    // (2) A의 대댓글 B
    const comment2 = await createComment(
      "도움이 되었다니 다행입니다.",
      "관리자",
      comment1
    );

    // (3) B의 대댓글 C (대대댓글)
    const comment3 = await createComment(
      "혹시 소스코드 공유 가능한가요?",
      "개발자1",
      comment2
    );

    // (4) 최상위 댓글 D (따로 노는 댓글)
    const comment4 = await createComment(
      "저도 Node.js 공부 중인데 반갑네요.",
      "학생2"
    );

    console.log("✅ 댓글 4개 생성 및 계층 연결 완료");

    process.exit(); // 프로세스 종료
  } catch (error) {
    console.error("❌ 에러 발생:", error);
    process.exit(1);
  }
};

seedData();
