import { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import PostEditor from '../components/PostEditor';

function PostCreate() {
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      setIsUploading(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error("업로드 실패");

        const data = await res.json();
        const imageUrl = data.url;

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', imageUrl); 
        quill.setSelection(range.index + 1);

      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        // ✅ 3. 성공하든 실패하든 무조건 로딩 끄기
        setIsUploading(false);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!title.trim() || !content.trim()) {
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

    setIsSubmitting(true);
    
    try {
      // 환경변수 사용 (없으면 로컬호스트)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const response = await fetch(`${API_URL}/api/posts`, {
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
        console.log("작성 성공");
        navigate('/'); 
        // 성공해서 페이지를 이동하니까 setIsSubmitting(false) 굳이 안 해도 됨
      } else {
        const data = await response.json();
        alert(data.error || "글 작성 실패");
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        // 3. 실패했을 땐 다시 버튼 풀어주기
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error("에러 발생:", error);
      alert("서버 오류가 발생했습니다.");
      // 3. 에러 났을 때도 버튼 풀어주기
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>글쓰기</h2>
      {/* 3. e.target.value를 사용해야 타이핑이 됩니다 */}
      <div style={{ marginBottom: "15px" }} className="title">
        <input 
          type="text" 
          placeholder="제목을 입력해 주세요 (최대 50자)" // 힌트 문구 수정
          maxLength={50} // ✅ 핵심: 50자 이상 입력 불가!
          style={{ width: "100%", padding: "10px", fontSize: "1.2rem", border: "1px solid #ccc", backgroundColor: "var(--input-bg)", color: "var(--text-main)"}}
          value={title}
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#888", marginTop: "5px" }}>
          {title.length} / 50
        </div>
      </div>
      {/* 3. 에디터 컴포넌트 사용 */}
      <PostEditor
        ref={quillRef} // Ref 전달
        value={content}
        onChange={setContent}
        onImageUpload={handleImageUpload} // 핸들러 전달
      />

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ marginRight: '10px', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>취소</button>
        <button 
          onClick={handleSubmit} 
          // ✅ 4. 업로드 중이거나 제출 중이면 클릭 금지
          disabled={isUploading || isSubmitting}
          style={{ 
            padding: '10px 20px', 
            // 상태에 따라 색상 변경 (회색/파란색)
            backgroundColor: (isUploading || isSubmitting) ? '#ccc' : '#339af0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            fontWeight: 'bold', 
            cursor: (isUploading || isSubmitting) ? 'not-allowed' : 'pointer' 
          }}
        >
          {/* ✅ 5. 텍스트도 상황에 맞게 변경 */}
          {isUploading ? "이미지 업로드 중..." : isSubmitting ? "저장 중..." : "등록하기"}
        </button>
      </div>
    </div>
  )
}



export default PostCreate;