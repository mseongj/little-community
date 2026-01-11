import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 백엔드 목록 API 호출
    fetch('http://localhost:3000/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

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
      <ul>
        {posts.map(post => (
          <li key={post._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            {/* 클릭하면 상세 페이지로 이동 */}
            <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none'}}>
              <h3>{post.title}</h3>
              <span style={{ color: '#888' }}>
                {post.author.nickname} · {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PostList;