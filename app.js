async function loadComments() {
  const commentListEl = document.getElementById("commentList");

  try {
    // 1. 실제 서버 API 호출 (로컬호스트 3000번)
    const response = await fetch(`${window.location.origin}/api/posts/latest`);
    const jsonData = await response.json();

    // 게시글 제목도 업데이트 해볼까요? (선택사항)
    document.querySelector(".post-title").innerText = jsonData.data.post.title;

    const comments = jsonData.data.comments;

    const commetnsLen = await comments.length;

    document.querySelector(".comment-count").innerText = commetnsLen.toString();

    // 2. 반복문 돌면서 HTML 생성
    comments.forEach((comment) => {
      // depth에 따라 클래스 추가
      const depthClass = `depth-${comment.depth}`;

      // ⚠️ 주의: MongoDB ID는 '_id' 입니다.
      // 작성일 포맷팅 (YYYY-MM-DD HH:MM)
      const date = new Date(comment.createdAt).toLocaleString();

      const html = `
                <div class="comment-item ${depthClass}" data-id="${
        comment._id
      }">
                    ${
                      comment.depth > 0
                        ? '<div class="comment-arrow">↳</div>'
                        : ""
                    }
                    <div class="comment-content-wrapper">
                        <div class="comment-header">
                            <span class="comment-author">${
                              comment.author.nickname
                            }</span>
                            <span class="comment-date">${date}</span>
                        </div>
                        <div class="comment-body">${comment.content}</div>
                        <div class="comment-actions">
                            <button class="btn-reply">답글 달기</button>
                        </div>
                    </div>
                </div>
            `;

      commentListEl.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("데이터를 불러오는데 실패했습니다:", error);
    commentListEl.innerHTML = "<p>댓글을 불러올 수 없습니다.</p>";
  }
}

// 페이지 로드 시 실행
loadComments();
