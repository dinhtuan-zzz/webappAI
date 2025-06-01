import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Highlighter } from 'lucide-react';

interface HighlightButtonProps {
  editor?: Editor | null;
}

export const HighlightButton: React.FC<HighlightButtonProps> = ({ editor }) => {
  const isActive = editor?.isActive('highlight');
  return (
    <Button
      type="button"
      className="tiptap-toolbar-btn"
      aria-label="Highlight"
      tooltip="Highlight"
      onClick={() => editor?.chain().focus().toggleHighlight().run()}
      disabled={!editor}
    >
      <Highlighter className="w-5 h-5" />
    </Button>
  );
};

export default HighlightButton; 