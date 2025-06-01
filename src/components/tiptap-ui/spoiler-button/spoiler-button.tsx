import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { EyeOff } from 'lucide-react';

interface SpoilerButtonProps {
  editor?: Editor | null;
}

export const SpoilerButton: React.FC<SpoilerButtonProps> = ({ editor }) => {
  const isActive = editor?.isActive('spoiler');
  return (
    <Button
      type="button"
      className="tiptap-toolbar-btn"
      aria-label="Spoiler"
      tooltip="Spoiler"
      onClick={() => editor?.chain().focus().toggleMark('spoiler').run()}
      disabled={!editor}
    >
      <EyeOff className="w-5 h-5" />
    </Button>
  );
};

export default SpoilerButton; 