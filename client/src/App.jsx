import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PostList from './pages/PostList';     // 목록 페이지 불러오기
import PostDetail from './pages/PostDetail'; // 상세 페이지 불러오기
import PostCreate from './pages/PostCreate';
import './App.css'; // (선택사항) 스타일

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode){
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode])

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
        </header>

        {/* 주소에 따라 화면이 바뀌는 부분 */}
        <Routes>
          {/* 1. 메인 화면 (목록) */}
          <Route path="/" element={<PostList />} />
          
          {/* 2. 상세 화면 (주소 뒤에 id가 붙음) */}
          <Route path="/posts/:id" element={<PostDetail />} />

          <Route path="/posts/create" element={<PostCreate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;