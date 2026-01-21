import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);
  
  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 1. 저장소 비우기
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // 2. 상태 초기화 (App.js의 user 상태를 null로)
    setUser(null);
    
    alert("로그아웃 되었습니다.");
    navigate("/"); // 메인으로 이동
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-container)',
      marginBottom: '30px',
    }}>
      {/* 1. 로고 영역 */}
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 'bold' }}>
          My Community
        </Link>
      </div>
      {/* 다크모드 토글 버튼 */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          padding: '8px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-body)',
          color: 'var(--text-main)',
          cursor: 'pointer'
        }}
        >
      {isDarkMode ? '☀️ 라이트 모드' : '🌙 다크 모드'}
      </button>

      {/* 2. 네비게이션 메뉴 영역 */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* 로그인 여부에 따라 다른 메뉴 보여주기 */}
        {user ? (
          // ✅ 로그인 했을 때 (로그아웃 버튼, 마이페이지, 프사)
          <>
            <Link to="/mypage" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-main)', gap: '8px' }}>
              {/* 프로필 이미지 (없으면 회색 기본 원) */}
              
              <img src={user.profileImage || "https://placehold.co/32"}  alt="프로필" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} />
              <span style={{ fontWeight: 'bold' }}>{user.nickname}님</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              style={{ padding: '6px 12px', cursor: 'pointer', background: '#ff6b6b', border: 'none', borderRadius: '4px', color: 'white' }}
            >
              로그아웃
            </button>
          </>
        ) : (
          // ❎ 로그인 안 했을 때 (로그인, 회원가입 버튼)
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>로그인</Link>
            <Link 
              to="/signup" 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                borderRadius: '4px', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;