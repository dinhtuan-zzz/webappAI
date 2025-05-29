import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar/toolbar';
import { MarkButton } from '@/components/tiptap-ui/mark-button/mark-button';
import { LinkPopover } from '@/components/tiptap-ui/link-popover/link-popover';
import ImageUploadButton from '@/components/tiptap-ui/image-upload-button/image-upload-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button/undo-redo-button';
import '@/styles/tiptap-editor.css';

interface CommentEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type your comment...',
  readOnly = false,
  autoFocus = false,
}) => {
  const extensions = [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'tiptap-editor-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
    }),
  ];
  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor${readOnly ? ' tiptap-editor-readonly' : ''}`,
        spellCheck: readOnly ? 'false' : 'true',
        'aria-label': placeholder,
      },
    },
  });

  // Keep editor content in sync with value prop (for edit mode)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus('end');
    }
  }, [editor, autoFocus]);

  return (
    <div className="tiptap-editor-wrapper">
      <Toolbar className="tiptap-toolbar mb-2" variant="fixed">
        <ToolbarGroup>
          <MarkButton editor={editor} type="bold" />
          <MarkButton editor={editor} type="italic" />
          <MarkButton editor={editor} type="underline" />
          <MarkButton editor={editor} type="strike" />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <LinkPopover editor={editor} />
          <ImageUploadButton editor={editor} />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <UndoRedoButton editor={editor} action="undo" />
          <UndoRedoButton editor={editor} action="redo" />
        </ToolbarGroup>
      </Toolbar>
      <EditorContent editor={editor} />
    </div>
  );
};

export default CommentEditor; 