import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLogo from '../assets/Google.svg';
import NaverLogo from '../assets/Naver.svg'
import KakaoLogo from '../assets/Kakao.svg'

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google로 로그인 하기
  const handleGoogleLogin = () => {
    // 1. 구글 설정 정보
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

    const STATE = Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem("google-state", STATE);
    // scope: 구글한테서 받아올 정보 범위 (email, profile)
    const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile&state=${STATE}`;

    // 3. 구글로 이동!
    window.location.href = googleURL;
  };
  // Naver로 로그인 하기
  const handleNaverLogin = () => {
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID; // 환경변수 사용
    const REDIRECT_URI = `${window.location.origin}/auth/naver/callback`;
    // const REDIRECT_URI = "http://localhost:5173/auth/naver/callback";
    const STATE = Math.random().toString(36).substring(2, 15); // 보안을 위한 랜덤 문자열 (실무에선 난수 생성 추천, 지금은 간단히)

    sessionStorage.setItem("naver_state", STATE);

    const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;

    window.location.href = naverURL;
  };

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;

    const STATE = Math.random().toString(36).substring(2, 15);
        
    sessionStorage.setItem("naver_state", STATE);
    
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

    window.location.href = kakaoURL;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 핵심: 토큰과 유저 정보를 로컬 스토리지에 저장!
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        alert("로그인 되었습니다!");
        
        // 메인으로 이동하면서 페이지를 새로고침 (헤더 상태 업데이트를 위해)
        // 나중에는 Context API를 쓰면 새로고침 없이 가능합니다.
        // window.location.href = '/';
        navigate('/');
      } else {
        alert(data.error || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "var(--bg-container)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-main)" }}>로그인</h2>
      
      <div style={{ marginBottom: "15px" }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius:"4px", color: "var(--text-main)" }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key==='Enter' && handleLogin()}
          style={{ width: "100%", padding: "10px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius:"4px", color: "var(--text-main)" }}
        />
      </div>

      <button 
        onClick={handleLogin}
        style={{ width: "100%", padding: "10px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
      >
        로그인 하기
      </button>
      <div style={{ marginTop: "25px", borderTop: "1px solid var(--border-color)", paddingTop: "20px", display: "flex", flexDirection: "column", height: "200px", justifyContent: "space-evenly" }}>
        <button 
          onClick={handleGoogleLogin}
          style={{ 
            width: "100%", padding: "10px", 
            backgroundColor: "#F2F2F2", border: "1px solid var(--border-color)", borderRadius: "5px", 
            cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontSize: "16px"
          }}
        >
          <img src={GoogleLogo} alt="G" width="20"/>
          Google 계정으로 로그인
        </button>
        <button 
          onClick={handleNaverLogin}
          style={{ 
            width: "100%", padding: "10px", 
            backgroundColor: "#03A94D", border: "1px solid var(--border-color)", borderRadius: "5px", color: "white", 
            cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "16px"
          }}
        >
          <img src={NaverLogo} alt="Naver" width="18" height="18"/>
          네이버 로그인
        </button>
        <button 
          onClick={handleKakaoLogin}
          style={{ 
            width: "100%", padding: "10px", 
            backgroundColor: "#FEE500", border: "1px solid var(--border-color)", borderRadius: "5px", color: "#000000 85%", 
            cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "16px"
          }}
        >
          <img src={KakaoLogo} alt="Kakao" width="18" height="18"/>
          카카오 로그인
        </button>

      </div>
      
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <a href="/signup" style={{ fontSize: "0.9rem", color: "var(--text-sub)" }}>회원가입 하러가기</a>
      </div>
    </div>
  );
}

export default LoginPage;