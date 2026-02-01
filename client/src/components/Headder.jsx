import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Headder.css';

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
<header className="main-header">
      {/* 1. 로고 영역 */}
      <div className="logo-area">
        <Link to="/" className="logo-text">
          My Community
        </Link>
      </div>

      {/* 2. 우측 컨트롤 영역 (다크모드 + 회원메뉴) */}
      <div className="right-controls">
        
        {/* 다크모드 토글 */}
        <div 
          className={`theme-toggle-wrapper ${isDarkMode ? 'dark' : ''}`} 
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="테마 변경"
        >
          <div className="toggle-thumb">
            {isDarkMode ? '🌙' : '☀️'}
          </div>
        </div>

        {/* 네비게이션 (로그인/회원가입/마이페이지) */}
        <nav className="nav-menu">
          {user ? (
            // ✅ 로그인 했을 때
            <>
              <Link to="/mypage" className="user-profile-link">
                <img 
                  src={user.profileImage || "https://placehold.co/32"} 
                  alt="프로필" 
                  className="header-profile-img"
                />
                <span className="user-nickname">{user.nickname}님</span>
              </Link>
              
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            // ❎ 로그인 안 했을 때
            <div className="auth-buttons">
              <Link to="/login" className="login-link">로그인</Link>
              <Link to="/signup" className="signup-btn">회원가입</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;