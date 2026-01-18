
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PostList from './pages/PostList';     // 목록 페이지
import PostDetail from './pages/PostDetail'; // 상세 페이지
import PostCreate from './pages/PostCreate'; // 글쓸기 페이지
import LoginPage from './pages/LoginPage'; // 로그인 페이지
import SignupPage from './pages/SignupPage';
import PostEdit from './pages/PostEdit';
import './App.css'; // 스타일

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [user, setUser] = useState(() => {
    // 컴포넌트가 처음 생성될 때 딱 한 번만 실행됨
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser); // 초기값으로 설정
    }
    return null; // 없으면 null
  });

  // Handle dark mode changes
  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 상단 네비게이션 */}
        <header style={{ 
          marginBottom: '20px', 
          paddingBottom: '10px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 'bold' }}>
            My Community
          </a>

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

            {user ? (
              <>
                <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{user.nickname}님</span>
                <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/login">
                <button style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}>
                  로그인
                </button>
              </Link>
            )}
        </header>

        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail user={user}/>} />
          <Route path="/posts/create" element={<PostCreate />} />
          <Route path='/posts/edit/:id' element={<PostEdit />} />
          <Route path="/login" element={<LoginPage setUser={setUser}/>} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;