import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CommentForm from '../components/CommentForm';

function PostDetail({ user }) {
  const navigate = useNavigate();
  const { id } = useParams(); // URL에서 id 가져오기
  const [data, setData] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);

  // 좋아요 상태 관리
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);

  // const user = JSON.parse(localStorage.getItem("user"));

  // 데이터 불러오는 함수를 따로 뺌 (댓글 작성 후 다시 불러오기 위해)
  const fetchPostData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`)
      .then(res => res.json())
      .then(result => setData(result));
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        
        // 초기 상태 설정 (좋아요 & 비추천)
        const likes = result.post.likes || [];
        const dislikes = result.post.dislikes || [];
        
        setLikesCount(likes.length);
        setDislikesCount(dislikes.length);

        if (user?.id) {
           setIsLiked(likes.includes(user.id));
           setIsDisliked(dislikes.includes(user.id));
        } else {
           setIsLiked(false);
           setIsDisliked(false);
        }
      });
  }, [id, user?.id]);

  // 좋아요 버튼 클릭 핸들러
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/like`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        // 🚨 중요: 4가지 상태를 모두 업데이트해야 서로 꼬이지 않음
        setLikesCount(result.likesCount);
        setDislikesCount(result.dislikesCount);
        setIsLiked(result.isLiked);
        setIsDisliked(result.isDisliked);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ 4. 비추천 버튼 핸들러 (새로 추가됨)
  const handleDislike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/dislike`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        // 여기도 4가지 상태 모두 업데이트
        setLikesCount(result.likesCount);
        setDislikesCount(result.dislikesCount);
        setIsLiked(result.isLiked);
        setIsDisliked(result.isDisliked);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <div>로딩 중...</div>;
  const { post, comments } = data;

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // 토큰 필수!
        }
      });

      if (response.ok) {
        alert("삭제되었습니다.");
        navigate('/'); // 목록으로 이동
      } else {
        const data = await response.json();
        alert(data.error || "삭제 실패");
      }
    } catch (error) {
      console.error(error);
      alert("에러 발생");
    }
  };

  if (!post) return <div>로딩 중...</div>;

  const isOwner = user && post.author && user.id === post.author.id;
  
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
           {/* ✅ 5. 버튼 UI 영역 */}
           <span style={{ marginLeft: '15px', display: 'inline-flex', gap: '10px' }}>
             {/* 좋아요 버튼 (빨강) */}
             <button 
               onClick={handleLike}
               style={{
                 background: isLiked ? '#ff6b6b' : 'white',
                 color: isLiked ? 'white' : '#ff6b6b',
                 border: '1px solid #ff6b6b',
                 borderRadius: '20px',
                 padding: '5px 12px',
                 cursor: 'pointer',
                 fontWeight: 'bold',
                 transition: '0.2s'
               }}
             >
               👍 추천 {likesCount}
             </button>

             {/* 비추천 버튼 (파랑/회색) */}
             <button 
               onClick={handleDislike}
               style={{
                 background: isDisliked ? '#4dabf7' : 'white',
                 color: isDisliked ? 'white' : '#4dabf7',
                 border: '1px solid #4dabf7',
                 borderRadius: '20px',
                 padding: '5px 12px',
                 cursor: 'pointer',
                 fontWeight: 'bold',
                 transition: '0.2s'
               }}
             >
               👎 비추 {dislikesCount}
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
      
      {isOwner && (
         <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
           <button 
             onClick={() => navigate(`/posts/edit/${id}`)} // 수정 페이지로 이동
             style={{ padding: '8px 16px', cursor: 'pointer' }}
           >
             수정
           </button>
           <button 
             onClick={handleDelete}
             style={{ padding: '8px 16px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
           >
             삭제
           </button>
         </div>
       )}
      
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