import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Minus } from 'lucide-react';

export interface HorizontalRuleButtonProps {
  editor?: Editor | null;
  tooltip?: string;
  shortcutKeys?: string;
}

export const HorizontalRuleButton: React.FC<HorizontalRuleButtonProps> = ({ editor, tooltip = "Horizontal rule", shortcutKeys = "Ctrl+Shift+H" }) => {
  return (
    <Button
      type="button"
      aria-label="Horizontal rule"
      className="tiptap-toolbar-btn"
      onClick={() => editor?.chain().focus().setHorizontalRule().run()}
      disabled={!editor}
      tooltip={tooltip}
      shortcutKeys={shortcutKeys}
    >
      <Minus className="tiptap-button-icon" />
    </Button>
  );
};

export default HorizontalRuleButton; 