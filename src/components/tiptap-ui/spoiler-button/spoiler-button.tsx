import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { EyeOff } from 'lucide-react';

interface SpoilerButtonProps {
  editor?: Editor | null;
}

// Extend Editor type to include custom command
interface EditorWithSpoiler extends Editor {
  commands: Editor['commands'] & {
    toggleSpoilerBlock: () => boolean;
  };
}

export const SpoilerButton: React.FC<SpoilerButtonProps> = ({ editor }) => {
  const typedEditor = editor as EditorWithSpoiler | null;
  const isActive = typedEditor?.isActive('spoilerBlock');
  const canWrap = typedEditor?.can().wrapIn('spoilerBlock');
  return (
    <Button
      type="button"
      className="tiptap-toolbar-btn"
      aria-label="Spoiler"
      tooltip={canWrap ? "Spoiler" : "Select a whole block to add a spoiler"}
      onClick={() => typedEditor?.commands.toggleSpoilerBlock()}
      disabled={!typedEditor || !canWrap}
      data-active-state={isActive ? 'on' : 'off'}
    >
      <EyeOff className="w-5 h-5" />
    </Button>
  );
};

export default SpoilerButton; 