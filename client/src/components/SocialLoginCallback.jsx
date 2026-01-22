import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// provider: "google" | "naver" | "kakao" | "github"
function SocialLoginCallback({ provider, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URL에서 code와 state(네이버용) 뽑기
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // ✅ 네이버 로그인일 때만 검증
    const savedState = sessionStorage.getItem(`${provider}_state`);
    if (savedState) {
      if (savedState !== state) {
        alert("보안 경고: 정상적인 요청이 아닙니다.");
        navigate("/login");
        return;
      }
      // 검증 성공하면 삭제
      sessionStorage.removeItem(`${provider}_state`);
    }

    if (code) {
      console.log(`${provider} 로그인 시도 중... code: ${code}`);

      // 2. 백엔드 API 주소 동적 생성 (/api/auth/google, /api/auth/naver 등)
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 네이버는 state가 필수고, 구글은 무시하니까 그냥 같이 보내도 상관없음!
        body: JSON.stringify({ code, state }), 
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // 3. 로그인 성공 처리 (공통)
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          alert(`${provider} 로그인 성공!`);
          navigate("/"); // 메인으로 이동
        } else {
          alert("로그인 실패");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("소셜 로그인 에러", err);
        alert("에러가 발생했습니다.");
        navigate("/login");
      });
    }
  }, [provider, navigate, setUser, location]); // 의존성 배열 꼼꼼히

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{provider} 로그인 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
      {/* 여기에 로딩 스피너(뱅글뱅글 도는거) 넣으면 딱 좋음 */}
    </div>
  );
}

export default SocialLoginCallback;