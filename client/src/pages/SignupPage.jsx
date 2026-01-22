import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();
  
  // 입력값 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignup = async () => {
    // 1. 유효성 검사 (빈칸 체크)
    if (!email || !password || !nickname) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      // 2. 서버로 회원가입 요청 보내기
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 시
        alert("회원가입 성공! 로그인 해주세요.");
        navigate("/login"); // 로그인 페이지로 이동
      } else {
        // 실패 시 (중복 이메일 등)
        alert(data.error || "회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "var(--bg-container)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-main)" }}>회원가입</h2>
      
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", color: "var(--text-main)" }}>이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex) test@example.com"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        
        <label style={{ display: "block", marginBottom: "5px", color: "var(--text-main)" }}>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <label style={{ display: "block", marginBottom: "5px", color: "var(--text-main)" }}>닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="커뮤니티에서 사용할 이름"
          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <button 
        onClick={handleSignup}
        style={{ width: "100%", padding: "12px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" }}
      >
        가입하기
      </button>
      
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <span style={{ color: "var(--text-sub)", fontSize: "0.9rem" }}>이미 아이디가 있으신가요? </span>
        <a href="/login" style={{ fontSize: "0.9rem", color: "var(--primary-color)", fontWeight: "bold" }}>로그인</a>
      </div>
    </div>
  );
}

export default SignupPage;