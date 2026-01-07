import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 1. .env 파일에 있는 주소로 연결 시도
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB 연결 성공! 호스트: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 연결 실패하면 서버 프로세스 종료
  }
};

export default connectDB;