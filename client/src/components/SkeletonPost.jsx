import "../App.css"; 

function SkeletonPost() {
  return (
    <div style={{ 
      border: '1px solid #eee', 
      padding: '15px', 
      marginBottom: '10px', 
      borderRadius: '8px', 
      background: 'white' 
    }}>
      {/* 제목 스켈레톤 */}
      <div className="skeleton" style={{ width: "60%", height: "24px", marginBottom: "10px" }}></div>
      
      {/* 정보(작성자, 조회수 등) 스켈레톤 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="skeleton" style={{ width: "40px", height: "16px" }}></div>
        <div className="skeleton" style={{ width: "40px", height: "16px" }}></div>
        <div className="skeleton" style={{ width: "40px", height: "16px" }}></div>
      </div>
    </div>
  );
}

export default SkeletonPost;