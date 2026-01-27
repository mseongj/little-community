import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignup = async () => {
    // 1. 공백 제거 (앞뒤 공백 실수 방지)
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim(); // 비밀번호는 공백 포함 정책에 따라 trim 안 할 수도 있음 (보통은 함)
    const trimmedNickname = nickname.trim();

    // 2. 유효성 검사

    // (1) 빈칸 체크
    if (!trimmedEmail || !trimmedPassword || !trimmedNickname) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // (2) 이메일 정규식 (기본적인 이메일 형식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    // (3) 비밀번호 규칙 (8~20자, 영문+숫자 포함)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      alert("비밀번호는 8~20자이며, 영문과 숫자를 최소 1개씩 포함해야 합니다.");
      return;
    }

    // (4) 닉네임 규칙 (2~10자, 한글/영문/숫자만, 공백X)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    if (!nicknameRegex.test(trimmedNickname)) {
      alert("닉네임은 2~10자의 한글, 영문, 숫자만 사용 가능합니다.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          password: trimmedPassword, 
          nickname: trimmedNickname 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입 성공! 로그인 해주세요.");
        navigate("/login");
      } else {
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
          maxLength={50} 
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        
        <label style={{ display: "block", marginBottom: "5px", color: "var(--text-main)" }}>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8~20자, 영문+숫자 포함"
          maxLength={20}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <label style={{ display: "block", marginBottom: "5px", color: "var(--text-main)" }}>닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="2~10자 (한글, 영문, 숫자)"
          maxLength={10}
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