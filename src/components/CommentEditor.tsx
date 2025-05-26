import React from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface CommentEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const CommentEditor: React.FC<CommentEditorProps> = ({ value, onChange, placeholder = 'Type your comment...', readOnly = false }) => {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={modules}
      readOnly={readOnly}
      placeholder={placeholder}
      theme="snow"
      style={{ minHeight: 100, maxHeight: 400 }}
    />
  );
};

export default CommentEditor; 