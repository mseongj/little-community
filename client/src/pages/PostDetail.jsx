import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function PostDetail() {
  const { id } = useParams(); // URL에서 id 가져오기
  const [data, setData] = useState(null);

  useEffect(() => {
    // 상세 API 호출
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then(res => res.json())
      .then(result => setData(result));
  }, [id]);

  if (!data) return <div>로딩 중...</div>;

  const { post, comments } = data;

  return (
    <div>
      <Link to="/">← 목록으로 돌아가기</Link>
      
      {/* 게시글 영역 */}
      <article className="post-container">
        <h1>{post.title}</h1>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {/* 댓글 영역 */}
      <div className="comment-list">
        <h3>댓글 {comments.length}개</h3>
        
        {comments.map(comment => (
          <div 
            key={comment._id} 
            className={`comment-item depth-${comment.depth}`}
            style={{ marginLeft: `${comment.depth * 40}px` }} // style로 직접 줘도 됩니다
          >
            {comment.depth > 0 && <div className="comment-arrow">↳</div>}
            
            <div className="comment-content-wrapper">
              <div className="comment-header">
                <strong>{comment.author.nickname}</strong>
              </div>
              <div className="comment-body">{comment.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;