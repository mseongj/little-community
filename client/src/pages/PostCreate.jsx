import { useState } from "react";
import { useNavigate } from 'react-router-dom';

function PostCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        // 1. headers는 JSON.stringify 하지 않고 객체 그대로 넣습니다.
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content,
          // author는 백엔드에서 처리하거나, 여기서 보내더라도 백엔드 로직에 맞게 조정
        }),
      });

      if (response.ok) {
        // 2. 성공했을 때만 페이지 이동 (await로 기다림)
        console.log("작성 성공");
        navigate('/'); 
      } else {
        console.error("작성 실패");
        alert("글 작성에 실패했습니다.");
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