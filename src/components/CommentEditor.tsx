import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import * as RadixPopover from '@radix-ui/react-popover';
import '@/styles/tiptap-editor.css';
import TextStyle from '@tiptap/extension-text-style';
import type { RawCommands } from '@tiptap/core';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu/heading-dropdown-menu';
import { FontFamilyDropdown } from '@/components/tiptap-ui/font-family-dropdown/font-family-dropdown';
import { FontSizeDropdown } from '@/components/tiptap-ui/font-size-dropdown/font-size-dropdown';
import { ListButtons } from '@/components/tiptap-ui/list-buttons/list-buttons';
import { QuoteButton } from '@/components/tiptap-ui/quote-button/quote-button';
import { LinkPopover } from '@/components/tiptap-ui/link-popover/link-popover';
import ImageUploadButton from '@/components/tiptap-ui/image-upload-button/image-upload-button';
import { YoutubeButton } from '@/components/tiptap-ui/youtube-button/youtube-button';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { TableButtons } from '@/components/tiptap-ui/table-buttons/table-buttons';
import { HorizontalRuleButton } from '@/components/tiptap-ui/horizontal-rule-button/horizontal-rule-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button/undo-redo-button';
import { MarkButton } from '@/components/tiptap-ui/mark-button/mark-button';
import { ColorButton } from '@/components/tiptap-ui/color-button/color-button';
import { HighlightButton } from '@/components/tiptap-ui/highlight-button/highlight-button';
import { SpoilerButton } from '@/components/tiptap-ui/spoiler-button/spoiler-button';
import { Palette, Highlighter, EyeOff } from 'lucide-react';
import Spoiler from '@/components/tiptap-ui/spoiler-mark';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar';
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { keymap } from 'prosemirror-keymap';
import { sinkListItem, liftListItem } from 'prosemirror-schema-list';

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
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
      listItem: false,
      code: false,
      codeBlock: false,
    }),
    BulletList,
    OrderedList,
    ListItem.extend({
      addProseMirrorPlugins() {
        return [
          keymap({
            Tab: (state, dispatch) => sinkListItem(this.type)(state, dispatch),
            'Shift-Tab': (state, dispatch) => liftListItem(this.type)(state, dispatch),
          }),
        ];
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'tiptap-editor-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
    }),
    TextStyle.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        };
      },
      addCommands() {
        return {
          setFontSize: (size: string) => ({ chain }: { chain: any }) => {
            return chain().setMark('textStyle', size ? { fontSize: size } : { fontSize: null }).run();
          },
        } as Partial<RawCommands>;
      },
    }),
    Color,
    FontFamily,
    Highlight,
    TaskList,
    TaskItem.configure({ nested: true }).extend({
      addProseMirrorPlugins() {
        return [
          keymap({
            Tab: (state, dispatch) => sinkListItem(this.type)(state, dispatch),
            'Shift-Tab': (state, dispatch) => liftListItem(this.type)(state, dispatch),
          }),
        ];
      },
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Youtube,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Spoiler,
  ];
  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      console.log('Editor HTML:', editor.getHTML());
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor${readOnly ? ' tiptap-editor-readonly' : ''}`,
        spellCheck: readOnly ? 'false' : 'true',
        'aria-label': placeholder,
      },
      handleClickOn(view, pos, node, nodePos, event, direct) {
        if (
          event.target instanceof HTMLAnchorElement &&
          (event.ctrlKey || event.metaKey)
        ) {
          window.open(event.target.href, '_blank', 'noopener,noreferrer');
          event.preventDefault();
          return true;
        }
        return false;
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

  const [showPreview, setShowPreview] = React.useState(false);
  const [moreBarMode, setMoreBarMode] = React.useState<null | 'text' | 'other'>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="tiptap-editor-wrapper">
      <div className="tiptap-editor-toolbar-bg rounded border shadow-sm bg-white/95 dark:bg-gray-900/95">
        <Toolbar className="rounded shadow border bg-white flex-wrap p-2" variant="fixed">
          <ToolbarGroup>
            <HeadingDropdownMenu editor={editor} className="align-middle" />
            <FontFamilyDropdown editor={editor} />
            <FontSizeDropdown editor={editor} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton editor={editor} type="bold" aria-label="Bold" tooltip="Bold" />
            <MarkButton editor={editor} type="italic" aria-label="Italic" tooltip="Italic" />
            <MarkButton editor={editor} type="underline" aria-label="Underline" tooltip="Underline" />
            <Button
              type="button"
              aria-label="More text options"
              aria-expanded={moreBarMode === 'text'}
              className="tiptap-toolbar-btn rounded hover:bg-gray-100 focus:bg-gray-200 transition-colors"
              tooltip="More text options"
              onClick={() => setMoreBarMode(moreBarMode === 'text' ? null : 'text')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ListButtons editor={editor} />
            <QuoteButton editor={editor} tooltip="Blockquote" shortcutKeys="Ctrl+Q" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <LinkPopover editor={editor} shortcutKeys="Ctrl+K" />
            <ImageUploadButton editor={editor} tooltip="Add image" shortcutKeys="Ctrl+Shift+I" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <Button
              type="button"
              aria-label="More"
              aria-expanded={moreBarMode === 'other'}
              className="tiptap-toolbar-btn rounded hover:bg-gray-100 focus:bg-gray-200 transition-colors"
              tooltip="More"
              onClick={() => setMoreBarMode(moreBarMode === 'other' ? null : 'other')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </Button>
          </ToolbarGroup>
          <ToolbarGroup className="ml-auto">
            <UndoRedoButton editor={editor} action="undo" tooltip="Undo" shortcutKeys="Ctrl+Z" />
            <UndoRedoButton editor={editor} action="redo" tooltip="Redo" shortcutKeys="Ctrl+Y" />
            <Button
              type="button"
              aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
              className="tiptap-toolbar-btn"
              tooltip={showPreview ? 'Hide Preview' : 'Show Preview'}
              shortcutKeys="Ctrl+P"
              onClick={() => setShowPreview((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPreview ? (
                  <>
                    <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2" fill="none" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="#888" strokeWidth="2" />
                  </>
                ) : (
                  <ellipse cx="12" cy="12" rx="10" ry="6" stroke="#888" strokeWidth="2" fill="none" />
                )}
              </svg>
            </Button>
          </ToolbarGroup>
        </Toolbar>
        {/* Secondary Toolbar (More) - only one group at a time */}
        <AnimatePresence>
          {moreBarMode && (
            <motion.div
              key="secondary-toolbar"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.15,
                ease: [0.46, 0.03, 0.52, 0.96]
              }}
              className="tiptap-toolbar-secondary flex items-center justify-center gap-2 min-h-[36px] p-1 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm w-full"
            >
              {moreBarMode === 'text' && (
                <>
                  <ColorButton editor={editor} />
                  <HighlightButton editor={editor} />
                  <SpoilerButton editor={editor} />
                </>
              )}
              {moreBarMode === 'other' && (
                <>
                  <TableButtons editor={editor} />
                  <HorizontalRuleButton editor={editor} tooltip="Horizontal rule" shortcutKeys="Ctrl+Shift+H" />
                  <YoutubeButton editor={editor} tooltip="YouTube" shortcutKeys="Ctrl+Shift+Y" />
                  <Button type="button" aria-label="Attach File" className="tiptap-toolbar-btn" tooltip="Attach File" shortcutKeys="Ctrl+Shift+A">Attach</Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!showPreview ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="tiptap-preview tiptap-editor p-4 min-h-[120px] border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
        </div>
      )}
    </div>
  );
};

export default CommentEditor; 