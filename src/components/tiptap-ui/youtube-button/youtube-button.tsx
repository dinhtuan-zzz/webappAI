import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Youtube } from 'lucide-react';

interface YoutubeButtonProps {
  editor?: Editor | null;
  tooltip?: string;
  shortcutKeys?: string;
}

export const YoutubeButton: React.FC<YoutubeButtonProps> = ({ editor, tooltip = "YouTube", shortcutKeys }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInsert = () => {
    if (!editor) return;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (!match) {
      setError('Invalid YouTube URL');
      return;
    }
    editor.chain().focus().setYoutubeVideo({ src: url, width: 480, height: 270 }).run();
    setOpen(false);
    setUrl('');
    setError(null);
  };

  return (
    <>
      <Button
        type="button"
        aria-label="Embed YouTube video"
        className="tiptap-toolbar-btn"
        onClick={() => setOpen(true)}
        disabled={!editor}
        tooltip={tooltip}
        shortcutKeys={shortcutKeys}
      >
        <Youtube className="tiptap-button-icon" />
      </Button>
      {open && (
        <div className="absolute z-50 bg-white border rounded shadow p-2 mt-2 flex flex-col gap-2" style={{ minWidth: 320 }}>
          <input
            type="url"
            placeholder="Paste YouTube URL..."
            value={url}
            onChange={e => { setUrl(e.target.value); setError(null); }}
            className="border rounded px-2 py-1 text-sm"
            autoFocus
          />
          {error && <div className="text-xs text-red-500">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={() => setOpen(false)} className="text-xs">Cancel</Button>
            <Button type="button" onClick={handleInsert} className="text-xs" disabled={!url}>Embed</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default YoutubeButton; 