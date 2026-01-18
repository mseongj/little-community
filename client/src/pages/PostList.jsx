import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PostList() {
  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);       // 현재 페이지 (기본 1)
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 개수

  const [keyword, setKeyword] = useState("");      // 입력창 값
  const [searchQuery, setSearchQuery] = useState(""); // 실제 검색 요청 보낼 값

  useEffect(() => {
    // 2. URL에 keyword 파라미터 추가
    // searchQuery가 비어있으면 그냥 전체 조회, 있으면 검색 조회
    fetch(`http://localhost:3000/api/posts?page=${page}&keyword=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error(err));
  }, [page, searchQuery]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setPage(1); // 검색하면 1페이지로 돌아가야 함
    setSearchQuery(keyword); // 입력창의 값을 실제 쿼리로 적용
  };
  
  // 엔터키 처리
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
          style={{ padding: '8px', flex: 1, border: '1px solid #ddd', borderRadius: '4px' }}
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
              <span>👍 {post.likes ? post.likes.length : 0}</span>
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