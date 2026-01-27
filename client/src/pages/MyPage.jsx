import { useState, useRef } from "react";

function MyPage({ user, setUser }) { // App.js에서 user, setUser 둘 다 받아야 함!
  const fileInputRef = useRef(null);

  const [prevUser, setPrevUser] = useState(user);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [currentImage, setCurrentImage] = useState(user?.profileImage || "https://placehold.co/150");
  const [isUploading, setIsUploading] = useState(false);


  if (user !== prevUser) {
    setPrevUser(user); // 기준값 업데이트
    
    // user 정보가 있을 때만 덮어쓰기
    if (user) {
      setNickname(user.nickname);
      setCurrentImage(user.profileImage || "https://placehold.co/150");
    }
  }

  // 2. 이미지 파일 선택 시 (S3 업로드 -> URL 미리보기)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);

    try {
      // S3 업로드
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      // 업로드된 URL을 화면에 미리 보여줌 (아직 저장 버튼 안 누름)
      setCurrentImage(data.url); 
    } catch (err) {
      console.error("이미지 업로드 실패", err);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. 저장 버튼 클릭 (DB 업데이트)
  const handleSave = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nickname: nickname,
                profileImage: currentImage // 바뀐 이미지 URL
            })
        });

        if (res.ok) {
            const updatedUser = await res.json();
            // 🚨 중요: App.js의 전역 상태도 업데이트해줘야 헤더 사진도 바뀜!
            setUser(updatedUser); 
            // 로컬 스토리지 정보도 갱신 (선택 사항)
            localStorage.setItem("user", JSON.stringify(updatedUser)); 
            alert("정보가 수정되었습니다.");
        } else {
            alert("수정 실패");
        }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>마이페이지</h2>

      {/* 프로필 이미지 영역 */}
      <div style={{ margin: "20px 0" }}>
        <img 
          src={currentImage} 
          alt="프로필" 
          style={{ 
            width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", 
            cursor: "pointer", border: "2px solid #ddd" 
          }}
          onClick={() => fileInputRef.current.click()} // 이미지 누르면 파일 선택창 열림
        />
        {isUploading && (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontWeight: "bold", color: "#333" }}>
            업로드 중..
          </span>
        )}
        {/* 숨겨진 input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*"
          onChange={handleImageChange}
        />
        <p style={{ fontSize: "0.8rem", color: "#888" }}>이미지를 클릭하여 변경</p>
      </div>

      {/* 닉네임 입력 */}
      <div style={{ textAlign: "left", marginBottom: "15px" }}>
        <label>닉네임</label>
        <input 
          type="text" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>

      <button 
        onClick={handleSave} 
        disabled={isUploading}
        style={{ 
          width: "100%", padding: "12px", 
          background: isUploading ? "#ccc" : "#339af0", 
          color: "white", border: "none", borderRadius: "5px", 
          cursor: isUploading ? "not-allowed" : "pointer" 
        }}
      >
        {isUploading ? "이미지 처리 중..." : "저장하기"}
      </button>
    </div>
  );
}

export default MyPage;