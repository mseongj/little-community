
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PostList from './pages/PostList';     // 목록 페이지
import PostDetail from './pages/PostDetail'; // 상세 페이지
import PostCreate from './pages/PostCreate'; // 글쓸기 페이지
import LoginPage from './pages/LoginPage'; // 로그인 페이지
import SignupPage from './pages/SignupPage';
import PostEdit from './pages/PostEdit';
import MyPage from './pages/MyPage';
import Header from './components/Headder';
import SocialLoginCallback from './components/SocialLoginCallback';
import './App.css'; // 스타일

function App() {
  const [user, setUser] = useState(() => {
    // 컴포넌트가 처음 생성될 때 딱 한 번만 실행됨
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser); // 초기값으로 설정
    }
    return null; // 없으면 null
  });

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 상단 네비게이션 */}
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail user={user}/>} />
          <Route path="/posts/create" element={<PostCreate />} />
          <Route path='/posts/edit/:id' element={<PostEdit />} />

          <Route path="/login" element={<LoginPage setUser={setUser}/>} />
          <Route path="/auth/google/callback" element={<SocialLoginCallback provider="google" setUser={setUser} />} />
          <Route path="/auth/naver/callback" element={<SocialLoginCallback provider="naver" setUser={setUser} />} />
          {/* 나중에 카카오 추가할 때도 복붙하고 provider만 바꾸면 끝! */}
          <Route path="/auth/kakao/callback" element={<SocialLoginCallback provider="kakao" setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

{/*
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
        */}