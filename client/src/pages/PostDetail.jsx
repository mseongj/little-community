import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentForm from '../components/CommentForm';

function PostDetail() {
  const { id } = useParams(); // URL에서 id 가져오기
  const [data, setData] = useState(null);

  const [activeReplyId, setActiveReplyId] = useState(null);

  // 좋아요 상태 관리 (별도로 빼서 관리하면 편함)
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // 데이터 불러오는 함수를 따로 뺌 (댓글 작성 후 다시 불러오기 위해)
  const fetchPostData = () => {
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then(res => res.json())
      .then(result => setData(result));
  };

  useEffect(() => {
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        
        // 1. 데이터 불러올 때 좋아요 상태 초기화
        // post.likes 배열에 내 ID가 있는지 확인
        if (result.post.likes && user?.id) {
           setIsLiked(result.post.likes.includes(user.id));
           setLikesCount(result.post.likes.length);
        } else {
           // 로그인을 안 했거나 likes가 없으면
           setLikesCount(result.post.likes ? result.post.likes.length : 0);
           setIsLiked(false);
        }
      });
  }, [id, user?.id]);

  // 좋아요 버튼 클릭 핸들러
  const handleLike = async () => {
    // 로그인 체크
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}/like`, {
        method: "PUT", // 서버랑 맞춤
        headers: {
          "Authorization": `Bearer ${token}` // 토큰 필수
        }
      });

      if (response.ok) {
        const result = await response.json();
        // 2. 서버 응답값으로 화면 즉시 업데이트 (새로고침 X)
        setLikesCount(result.likesCount);
        setIsLiked(result.isLiked);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <div>로딩 중...</div>;
  const { post, comments } = data;

  return (
    <div>
      <Link to="/">← 목록으로 돌아가기</Link>
      
      {/* 게시글 영역 */}
      <article className="post-container">
        <h1>{post.title}</h1>
        
        {/* 작성자 및 날짜 등 */}
        <div className="post-meta">
           <span>{post.author.nickname}</span>
           <span>조회 {post.views}</span>
           {/* 좋아요 버튼 위치 */}
           <span style={{ marginLeft: '10px' }}>
             <button 
               onClick={handleLike}
               style={{
                 background: isLiked ? '#ff6b6b' : 'white', // 눌렀으면 빨강, 아니면 흰색
                 color: isLiked ? 'white' : '#ff6b6b',
                 border: '1px solid #ff6b6b',
                 borderRadius: '20px',
                 padding: '5px 12px',
                 cursor: 'pointer',
                 fontWeight: 'bold'
               }}
             >
               👍 추천 {likesCount}
             </button>
           </span>
        </div>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={{width:'100%'}}/>
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