import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // 1. 헤더에서 토큰 꺼내기 (보통 "Bearer <토큰>" 형식으로 옵니다)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer" 떼고 토큰만 가져옴

  if (!token) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    // 2. 토큰 검증 ("비밀키"는 로그인할 때 쓴 것과 똑같아야 함!)
    const decoded = jwt.verify(token, "비밀키");

    // 3. 검증된 정보를 req 객체에 붙여서 다음 단계로 넘김
    req.user = decoded; // { userId: "..." }
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
};

export default authMiddleware;
