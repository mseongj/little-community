import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
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
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key==='Enter' && handleLogin()}
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <button 
        onClick={handleLogin}
        style={{ width: "100%", padding: "10px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
      >
        로그인 하기
      </button>
      
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <a href="/signup" style={{ fontSize: "0.9rem", color: "var(--text-sub)" }}>회원가입 하러가기</a>
      </div>
    </div>
  );
}

export default LoginPage;