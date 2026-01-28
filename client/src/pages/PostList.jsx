import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function PostList() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const urlKeyword = queryParams.get("keyword") || "";

  // 1. 기존 state
  const [keyword, setKeyword] = useState(urlKeyword);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [prevUrlKeyword, setPrevUrlKeyword] = useState(urlKeyword);

  if (urlKeyword !== prevUrlKeyword) {
    setPrevUrlKeyword(urlKeyword); // 기준값 업데이트
    setKeyword(urlKeyword);        // 입력창 업데이트
    setPage(1);                    // 페이지 리셋
  }

  useEffect(() => {
    // ✅ 4. 'searchQuery' 상태 대신 'urlKeyword'를 직접 사용해서 fetch
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    
    fetch(`${API_URL}/api/posts?page=${page}&keyword=${urlKeyword}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error(err));
  }, [page, urlKeyword]); // 의존성 배열에 urlKeyword 넣기

  // 검색 핸들러
  const handleSearch = () => {
    // ✅ 5. state를 바꾸는 게 아니라, URL을 변경함!
    // navigate를 쓰면 페이지 이동 효과가 남
    navigate(`/?keyword=${keyword}`);
    setPage(1);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>커뮤니티 게시판</h1>
        
        {/* ✅ 글쓰기 버튼 추가 */}
        <Link to="/posts/create">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#339af0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            글쓰기
          </button>
        </Link>
      </div>
      {/* 검색창 UI 추가 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="제목이나 내용으로 검색" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ padding: '8px', flex: 1, border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-container)' }}
        />
        <button 
          onClick={handleSearch}
          style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          검색
        </button>
      </div>

      {/* 게시글 리스트 렌더링 */}
      <div className="post-list">
        {posts.map((post) => (
          <div key={post._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', background: 'var(--bg-container)' }}>
            <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{post.title}</h3>
            </Link>
            <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', gap: '10px' }}>
              <span>✍️ {post.author.nickname}</span>
              <span>👀 {post.views}</span>
              <span style={{ color: '#ff6b6b' }}>
                👍 {post.likes ? post.likes.length : 0}
              </span>
              <span style={{ color: '#4dabf7' }}>
                👎 {post.dislikes ? post.dislikes.length : 0}
              </span>
              <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 버튼 영역 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
        
        {/* < 이전 버튼 */}
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          &lt; 이전
        </button>

        {/* 페이지 번호들 (1, 2, 3...) */}
        {/* Array.from({ length: 5 }) -> [undefined, undefined, ...] 5칸짜리 배열 생성 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            style={{
              padding: '5px 12px',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '4px',
              // 현재 페이지는 색깔 다르게!
              background: page === pageNum ? 'var(--primary-color)' : 'white',
              color: page === pageNum ? 'white' : 'black',
              fontWeight: page === pageNum ? 'bold' : 'normal'
            }}
          >
            {pageNum}
          </button>
        ))}

        {/* 다음 > 버튼 */}
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          다음 &gt;
        </button>
      </div>
    </div>
  );
}

export default PostList;