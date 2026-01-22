import { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import PostEditor from '../components/PostEditor';

function PostCreate() {
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 1. 이미지 핸들러 (핵심 로직!)
  const handleImageUpload = useCallback(() => {
    // 1-1. 보이지 않는 input[type="file"]을 만듭니다.
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*'); // 이미지 파일만
    input.click(); // 강제로 클릭!

    // 1-2. 파일을 선택하면 실행되는 함수
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // 1-3. 서버로 파일 전송 (Multer-S3)
      const formData = new FormData();
      formData.append('image', file); // 백엔드 설정인 'image'와 이름 같아야 함

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: 'POST',
          body: formData, // 헤더에 Content-Type 쓰지 마세요! (자동 설정됨)
        });
        
        const data = await res.json();
        const imageUrl = data.url; // S3 이미지 주소

        // 1-4. 에디터에 이미지 삽입
        const quill = quillRef.current.getEditor(); // 에디터 객체 가져오기
        const range = quill.getSelection(); // 현재 커서 위치 가져오기
        
        // 커서 위치에 이미지 태그 삽입
        quill.insertEmbed(range.index, 'image', imageUrl); 
        
        // 커서를 이미지 다음으로 이동
        quill.setSelection(range.index + 1);

      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };
  }, []); // 의존성 없음

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
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
      <div style={{ marginBottom: "15px" }} className="title">
        <input 
          type="text" 
          placeholder="제목을 입력해 주세요" 
          style={{ width: "100%", padding: "10px", fontSize: "1.2rem", border: "1px solid #ccc", backgroundColor: "var(--input-bg)", color: "var(--text-main)"}}
          value={title}
          onChange={(e) => setTitle(e.target.value)} 
        />
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
          style={{ padding: '10px 20px', backgroundColor: '#339af0', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          등록하기
        </button>
      </div>
    </div>
  )
}



export default PostCreate;