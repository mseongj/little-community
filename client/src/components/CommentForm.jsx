import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// props로 postId와 부모댓글ID(선택), 그리고 작성이 끝났을 때 실행할 함수(onSuccess)를 받습니다.
function CommentForm({ postId, parentCommentId = null, onSuccess }) {
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
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
      const response = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          content,
          parentCommentId, // 이게 있으면 대댓글, 없으면 그냥 댓글
        }),
      });

      if (response.ok) {
        setContent(""); // 입력창 비우기
        if (onSuccess) onSuccess(); // 부모 컴포넌트에게 "나 다 썼어!" 하고 알림
      } else {
        alert("댓글 작성 실패");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "5px" }}>
      <textarea
        style={{ width: "100%", height: "60px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
        placeholder={parentCommentId ? "답글을 입력하세요..." : "댓글을 남겨보세요."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div style={{ textAlign: "right", marginTop: "5px" }}>
        <button 
          onClick={handleSubmit}
          style={{ padding: "6px 12px", background: "#339af0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          등록
        </button>
      </div>
    </div>
  );
}

export default CommentForm;