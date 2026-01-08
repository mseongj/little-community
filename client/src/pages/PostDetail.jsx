import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentForm from '../components/CommentForm';

function PostDetail() {
  const { id } = useParams(); // URL에서 id 가져오기
  const [data, setData] = useState(null);

  const [activeReplyId, setActiveReplyId] = useState(null);

  // 데이터 불러오는 함수를 따로 뺌 (댓글 작성 후 다시 불러오기 위해)
  const fetchPostData = () => {
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then(res => res.json())
      .then(result => setData(result));
  };

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

      {/* 최상위 댓글 작성 폼 (게시글 바로 밑) */}
      <section style={{ marginBottom: '30px' }}>
        <h3>댓글 쓰기</h3>
        <CommentForm 
          postId={id} 
          onSuccess={() => fetchPostData()} // 작성 완료되면 목록 새로고침
        />
      </section>
      
      {/* 댓글 목록 */}
      <div className="comment-list">
        <h3>댓글 {comments.length}개</h3>
        
        {comments.map(comment => (
          <div 
            key={comment._id} 
            className={`comment-item depth-${comment.depth}`}
            style={{ marginLeft: `${comment.depth * 40}px` }}
          >
            {comment.depth > 0 && <div className="comment-arrow">↳</div>}
            
            <div className="comment-content-wrapper">
              <div className="comment-header">
                <strong>{comment.author.nickname}</strong>
                {/* 답글 달기 버튼: 누르면 이 댓글의 ID를 activeReplyId에 저장 */}
                <button 
                  onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                  style={{ marginLeft: '10px', fontSize: '0.8rem', cursor: 'pointer', background: 'none', border: 'none', color: 'blue' }}
                >
                  {activeReplyId === comment._id ? "닫기" : "답글 달기"}
                </button>
              </div>
              <div className="comment-body">{comment.content}</div>

              {/* 4. 이 댓글에 대한 대댓글 폼 (조건부 렌더링) */}
              {activeReplyId === comment._id && (
                <div className="reply-form-container">
                  <CommentForm 
                    postId={id}
                    parentCommentId={comment._id} // 부모 ID를 넘겨줌!
                    onSuccess={() => {
                      fetchPostData();    // 새로고침
                      setActiveReplyId(null); // 폼 닫기
                    }}
                  />
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;