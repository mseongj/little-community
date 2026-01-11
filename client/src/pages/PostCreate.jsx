import { useState } from "react";
import { useNavigate } from 'react-router-dom';

function PostCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if(!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 로컬 스토리지에서 토큰 꺼내기
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login'); // 로그인 페이지로 쫓아냄
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
      });

      if (response.ok) {
        // 2. 성공했을 때만 페이지 이동 (await로 기다림)
        console.log("작성 성공");
        navigate('/'); 
      } else {
        const data = await response.json();
        alert(data.error || "글 작성 실패");
        if (response.status === 401 || response.status === 403) {
          navigate('/login'); // 인증 실패시 로그인으로 이동
        }
      }
      
    } catch (error) {
      console.error("에러 발생:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>글쓰기</h2>
      {/* 3. e.target.value를 사용해야 타이핑이 됩니다 */}
      <div style={{ marginBottom: "10px" }}>
        <input 
          type="text" 
          placeholder="제목을 입력해 주세요" 
          style={{ width: "100%", padding: "8px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)} 
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea 
          placeholder="내용을 입력해주세요" 
          style={{ width: "100%", height: "200px", padding: "8px" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>
      <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
        작성 완료
      </button>
    </div>
  )
}



export default PostCreate;