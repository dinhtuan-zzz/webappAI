import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';

interface QuoteButtonProps {
  editor?: Editor | null;
  tooltip?: string;
  shortcutKeys?: string;
}

export const QuoteButton: React.FC<QuoteButtonProps> = ({ editor, tooltip = "Blockquote", shortcutKeys }) => {
  const isActive = editor?.isActive('blockquote');
  return (
    <Button
      type="button"
      aria-label="Blockquote"
      className={`tiptap-toolbar-btn${isActive ? ' bg-gray-200' : ''}`}
      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
      disabled={!editor}
      tooltip={tooltip}
      shortcutKeys={shortcutKeys}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline align-middle"><path d="M17 6a4 4 0 0 1 0 8h-3v4"/><path d="M7 6a4 4 0 0 1 0 8H4v4"/></svg>
    </Button>
  );
};

export default QuoteButton; 