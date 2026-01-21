import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function GoogleCallback({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URL에서 '?code=...' 부분 찾기
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code"); // 구글이 준 임시 번호표

    if (code) {
      console.log("구글에서 받은 코드:", code);
      
      // 2. 백엔드에 코드 전달 (백엔드 구현은 직접 하실 부분!)
      fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }), // 코드를 백엔드로 토스
      })
      .then((res) => {res.json(); console.log(res)})
      .then((data) => {
        if (data.token) {
          // 3. 로그인 성공 처리 (기존 로그인 로직과 동일)
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          alert("구글 로그인 성공!");
          navigate("/"); // 메인으로 이동
        } else {
          alert("로그인 실패");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("소셜 로그인 에러", err);
        navigate("/login");
      });
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>구글 로그인 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}

export default GoogleCallback;