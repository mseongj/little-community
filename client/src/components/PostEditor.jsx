// client/src/components/PostEditor.jsx
import { useMemo, forwardRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // 스타일 불러오기

const PostEditor = forwardRef(({ value, onChange, onImageUpload }, ref) => {

  // 3. 툴바 설정 (이미지 버튼 포함)
  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'], // 이미지 버튼 추가
        ],
        handlers: {
          // 이미지 버튼을 눌렀을 때 실행될 커스텀 함수
          image: onImageUpload, 
        },
      },
    };
  }, [onImageUpload]);

  return (
    <ReactQuill
      ref={ref}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules} // 위에서 만든 설정 적용
      style={{ height: '400px', marginBottom: '50px' }} // 높이 설정
    />
  );
});
PostEditor.displayName = 'PostEditor';

export default PostEditor;