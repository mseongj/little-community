import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// props로 postId와 부모댓글ID(선택), 그리고 작성이 끝났을 때 실행할 함수(onSuccess)를 받습니다.
function CommentForm({ postId, parentCommentId = null, onSuccess }) {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          content,
          parentCommentId, 
        }),
      });

      if (response.ok) {
        setContent(""); 
        if (onSuccess) onSuccess(); 
      } else {
        const data = await response.json();
        alert(data.error || "댓글 작성 실패");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      // ✅ 5. 성공하든 실패하든 버튼 잠금 해제
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "10px", padding: "10px", background: "var(--bg-body)", borderRadius: "5px" }}>
      <textarea
        style={{ width: "100%", height: "60px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
        placeholder={parentCommentId ? "답글을 입력하세요..." : "댓글을 남겨보세요."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting} // 작성 중엔 입력창도 잠그면 더 좋음 (선택)
      />
      <div style={{ textAlign: "right", marginTop: "5px" }}>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting} // ✅ 6. 버튼 비활성화
          style={{ 
            padding: "6px 12px", 
            // 상태에 따라 색상 변경
            background: isSubmitting ? "#ccc" : "#339af0", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: isSubmitting ? "not-allowed" : "pointer" 
          }}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}

export default CommentForm;