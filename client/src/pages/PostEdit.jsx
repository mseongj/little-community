import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostEditor from '../components/PostEditor'; // 에디터 재사용

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        // 기존 제목과 내용을 state에 채워넣음
        setTitle(data.post.title);
        setContent(data.post.content);
      });
  }, [id]);

  // 2. 이미지 핸들러 (PostCreate와 동일)
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
        const res = await fetch('http://localhost:3000/api/upload', {
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

  // 3. 수정 요청 (PUT)
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login'); // 로그인 페이지로 쫓아냄
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "PUT", // 👈 POST가 아니라 PUT 사용!
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        alert("수정되었습니다!");
        navigate(`/posts/${id}`); // 상세 페이지로 돌아가기
      } else {
        const data = await response.json();
        alert(data.error || "글 수정 실패");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>글 수정하기</h2>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />
      <PostEditor
        ref={quillRef}
        value={content}
        onChange={setContent}
        onImageUpload={handleImageUpload}
      />
      <button onClick={handleSubmit} style={{ marginTop: "20px", padding: "10px 20px" }}>
        수정 완료
      </button>
    </div>
  );
}

export default PostEdit;