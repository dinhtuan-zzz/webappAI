import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Mention from '@tiptap/extension-mention';
import Youtube from '@tiptap/extension-youtube';
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Paperclip,
  Smile,
} from 'lucide-react';
import Picker from '@emoji-mart/react';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';

// Dummy mention data for demo; replace with your user fetch logic
const mentionUsers = [
  { id: '1', label: 'alice' },
  { id: '2', label: 'bob' },
  { id: '3', label: 'charlie' },
];

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('bash', bash);
lowlight.register('json', json);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('markdown', markdown);

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'css', label: 'CSS' },
  { value: 'markdown', label: 'Markdown' },
];

export interface TipTapEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  extensions?: Extension[];
  minHeight?: string;
  autoSaveKey?: string; // for localStorage drafts
}

const defaultExtensions = [
  StarterKit.configure({
    codeBlock: false, // Disable default code block
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Underline,
  Image,
  Link.configure({ autolink: true, openOnClick: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  Youtube,
  Highlight,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Mention.configure({
    HTMLAttributes: { class: 'mention' },
    suggestion: {
      items: ({ query }: { query: string }) =>
        mentionUsers.filter(user => user.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
      render: () => {
        let component: HTMLDivElement | null = null;
        // Closure-scoped state for keydown
        let latestItems: typeof mentionUsers = [];
        let latestSelectedIndex = 0;
        let latestCommand: ((item: typeof mentionUsers[0]) => void) | null = null;
        return {
          onStart: (props: SuggestionProps<typeof mentionUsers[0], typeof mentionUsers[0]>) => {
            component = document.createElement('div');
            component.className = 'bg-white border rounded shadow p-2';
            latestItems = props.items;
            latestSelectedIndex = (props as unknown as { selectedIndex?: number }).selectedIndex ?? 0;
            latestCommand = props.command;
            update(props);
            document.body.appendChild(component);
          },
          onUpdate: (props: SuggestionProps<typeof mentionUsers[0], typeof mentionUsers[0]>) => {
            latestItems = props.items;
            latestSelectedIndex = (props as unknown as { selectedIndex?: number }).selectedIndex ?? 0;
            latestCommand = props.command;
            update(props);
          },
          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (props.event.key === 'Enter' && latestCommand && latestItems.length > 0) {
              latestCommand(latestItems[latestSelectedIndex]);
              return true;
            }
            return false;
          },
          onExit: (_props: unknown) => {
            if (component) {
              document.body.removeChild(component);
            }
          },
        };
        function update(props: SuggestionProps<typeof mentionUsers[0], typeof mentionUsers[0]> & { selectedIndex?: number }) {
          if (!component) return;
          const selectedIndex = (props as unknown as { selectedIndex?: number }).selectedIndex ?? 0;
          component.innerHTML = props.items
            .map((item, i) => `<div class='${i === selectedIndex ? 'bg-blue-100' : ''} p-1'>@${item.label}</div>`) 
            .join('');
        }
      },
    },
  }),
];

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  extensions,
  minHeight = '120px',
  autoSaveKey,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [emojiData, setEmojiData] = useState<any>(null);
  const [emojiLoading, setEmojiLoading] = useState(false);

  // Editor state for auto-save
  const [editor, setEditor] = useState<import('@tiptap/core').Editor | null>(null);
  useEffect(() => {
    if (!autoSaveKey || !editor) return;
    const interval = setInterval(() => {
      if (editor && editor.getHTML()) {
        localStorage.setItem(autoSaveKey, editor.getHTML());
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [autoSaveKey, editor]);

  // Load draft from localStorage
  useEffect(() => {
    if (autoSaveKey && editor && !value) {
      const draft = localStorage.getItem(autoSaveKey);
      if (draft) editor.commands.setContent(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, autoSaveKey]);

  const tiptapEditor = useEditor({
    extensions: [
      ...defaultExtensions,
      ...(extensions || []),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      console.log('onUpdate HTML:', editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight}; outline: none;`,
        placeholder: placeholder || '',
      },
    },
    onCreate: ({ editor }) => setEditor(editor),
  });

  useEffect(() => {
    if (tiptapEditor && value !== undefined && value !== tiptapEditor.getHTML()) {
      tiptapEditor.commands.setContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Load emoji data remotely when emoji picker is opened
  useEffect(() => {
    if (showEmoji && !emojiData) {
      setEmojiLoading(true);
      import('@emoji-mart/data').then((mod) => {
        setEmojiData(mod.default || mod);
        setEmojiLoading(false);
      });
    }
  }, [showEmoji, emojiData]);

  if (!tiptapEditor) return null;

  // Toolbar actions with debug logging
  const logEditorState = () => {
    if (tiptapEditor) {
      console.log('TipTapEditor state:', tiptapEditor.getJSON());
      console.log('TipTapEditor HTML:', tiptapEditor.getHTML());
    }
  };

  // Toolbar actions
  const setImage = (url: string) => {
    tiptapEditor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiSelect = (emoji: { native?: string; colons?: string }) => {
    const symbol = emoji.native || emoji.colons || '';
    tiptapEditor.chain().focus().insertContent(symbol).run();
    setShowEmoji(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For demo: create a local URL. In production, upload to server and use the returned URL.
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setShowFile(false);
    // Insert a link to the file
    tiptapEditor.chain().focus().insertContent(`<a href="${url}" target="_blank">${file.name}</a>`).run();
  };

  // Helper to ensure heading is editable after toggle
  const toggleHeadingAndFocus = (level: 1|2|3|4|5|6) => {
    tiptapEditor.chain().focus().toggleHeading({ level }).run();
    // Check if the selection is in an empty heading node
    const { state, view } = tiptapEditor;
    const { $from } = state.selection;
    const node = $from.node($from.depth);
    if (node.type.name === 'heading' && node.content.size === 0) {
      // Insert a zero-width space so typing works
      tiptapEditor.commands.insertContent('\u200B');
      // Move selection back one character so typing replaces the space
      const pos = tiptapEditor.state.selection.from - 1;
      tiptapEditor.commands.setTextSelection(pos);
    }
    logEditorState();
  };

  // Responsive, accessible toolbar
  return (
    <div>
      {!readOnly && (
        <nav className="flex flex-wrap gap-2 mb-2 items-center bg-gray-50 border border-gray-200 rounded-t px-2 py-1 sticky top-0 z-10" aria-label="Editor toolbar">
          <button type="button" aria-label="Bold" onClick={() => { tiptapEditor.chain().focus().toggleBold().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('bold') ? 'text-blue-600 bg-blue-50' : ''}`}><Bold size={18} /></button>
          <button type="button" aria-label="Italic" onClick={() => { tiptapEditor.chain().focus().toggleItalic().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('italic') ? 'text-blue-600 bg-blue-50' : ''}`}><Italic size={18} /></button>
          <button type="button" aria-label="Underline" onClick={() => { tiptapEditor.chain().focus().toggleUnderline().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('underline') ? 'text-blue-600 bg-blue-50' : ''}`}><UnderlineIcon size={18} /></button>
          <button type="button" aria-label="Strike" onClick={() => { tiptapEditor.chain().focus().toggleStrike().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('strike') ? 'text-blue-600 bg-blue-50' : ''}`}><Strikethrough size={18} /></button>
          <button type="button" aria-label="Quote" onClick={() => { tiptapEditor.chain().focus().toggleBlockquote().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('blockquote') ? 'text-blue-600 bg-blue-50' : ''}`}><Quote size={18} /></button>
          <button type="button" aria-label="Bullet List" onClick={() => { tiptapEditor.chain().focus().toggleBulletList().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('bulletList') ? 'text-blue-600 bg-blue-50' : ''}`}><List size={18} /></button>
          <button type="button" aria-label="Ordered List" onClick={() => { tiptapEditor.chain().focus().toggleOrderedList().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('orderedList') ? 'text-blue-600 bg-blue-50' : ''}`}><ListOrdered size={18} /></button>
          <button type="button" aria-label="Code Block" onClick={() => {
            if (tiptapEditor.isActive('codeBlock')) {
              tiptapEditor.chain().focus().toggleCodeBlock().run();
            } else {
              tiptapEditor.chain().focus().setCodeBlock({ language: 'javascript' }).run();
            }
            logEditorState();
          }} className={`toolbar-btn ${tiptapEditor.isActive('codeBlock') ? 'text-blue-600 bg-blue-50' : ''}`}><Code2 size={18} /></button>
          {tiptapEditor.isActive('codeBlock') && (
            <select
              className="ml-2 border rounded px-2 py-1 text-xs"
              value={tiptapEditor.getAttributes('codeBlock').language || 'javascript'}
              onChange={e => {
                tiptapEditor.chain().focus().setCodeBlock({ language: e.target.value }).run();
              }}
            >
              {CODE_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          )}
          <button type="button" aria-label="Link" onClick={() => { tiptapEditor.chain().focus().setLink({ href: prompt('Enter URL') || '' }).run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('link') ? 'text-blue-600 bg-blue-50' : ''}`}><LinkIcon size={18} /></button>
          <button type="button" aria-label="Image" onClick={() => { fileInputRef.current?.click(); logEditorState(); }} className="toolbar-btn"><ImageIcon size={18} /></button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button type="button" aria-label="Video" onClick={() => {
            const url = prompt('YouTube URL');
            if (url) tiptapEditor.chain().focus().setYoutubeVideo({ src: url }).run();
          }} className="toolbar-btn"><Video size={18} /></button>
          <button type="button" aria-label="Table" onClick={() => tiptapEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="toolbar-btn"><TableIcon size={18} /></button>
          <button type="button" aria-label="File Attachment" onClick={() => setShowFile(true)} className="toolbar-btn"><Paperclip size={18} /></button>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            id="file-upload-input"
          />
          {showFile && (
            <label htmlFor="file-upload-input" className="bg-gray-100 border p-2 rounded cursor-pointer">Choose file
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </label>
          )}
          <button type="button" aria-label="Emoji" onClick={() => setShowEmoji((v) => !v)} className="toolbar-btn"><Smile size={18} /></button>
          {showEmoji && (
            <div className="absolute z-10 mt-2">
              {emojiLoading && <div className="p-4">Loading emojis…</div>}
              {emojiData && (
                <Picker data={emojiData} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="none" />
              )}
            </div>
          )}
          <button type="button" aria-label="Paragraph" onClick={() => { tiptapEditor.chain().focus().setParagraph().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('paragraph') ? 'text-blue-600 bg-blue-50' : ''}`}>¶</button>
          <button type="button" aria-label="Highlight" onClick={() => { tiptapEditor.chain().focus().toggleHighlight().run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive('highlight') ? 'text-yellow-600 bg-yellow-50' : ''}`}>Mark</button>
          <button type="button" aria-label="Align Left" onClick={() => { tiptapEditor.chain().focus().setTextAlign('left').run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive({ textAlign: 'left' }) ? 'text-blue-600 bg-blue-50' : ''}`}>L</button>
          <button type="button" aria-label="Align Center" onClick={() => { tiptapEditor.chain().focus().setTextAlign('center').run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive({ textAlign: 'center' }) ? 'text-blue-600 bg-blue-50' : ''}`}>C</button>
          <button type="button" aria-label="Align Right" onClick={() => { tiptapEditor.chain().focus().setTextAlign('right').run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive({ textAlign: 'right' }) ? 'text-blue-600 bg-blue-50' : ''}`}>R</button>
          <button type="button" aria-label="Align Justify" onClick={() => { tiptapEditor.chain().focus().setTextAlign('justify').run(); logEditorState(); }} className={`toolbar-btn ${tiptapEditor.isActive({ textAlign: 'justify' }) ? 'text-blue-600 bg-blue-50' : ''}`}>J</button>
          <HeadingDropdownMenu levels={[1,2,3,4,5,6]} editor={tiptapEditor} />
        </nav>
      )}
      <div className={`tiptap prose prose-editor border rounded p-2 bg-white ${readOnly ? 'opacity-80 pointer-events-none' : ''}`}
           style={{ minHeight }}>
        <EditorContent editor={tiptapEditor} />
      </div>
      {/* File preview for attachments (optional) */}
      {fileUrl && (
        <div className="mt-2 text-sm">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download attached file</a>
        </div>
      )}
    </div>
  );
};

export default TipTapEditor;