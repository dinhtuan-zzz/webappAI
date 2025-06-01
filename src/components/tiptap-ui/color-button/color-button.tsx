import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/tiptap-ui-primitive/popover/popover';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Palette } from 'lucide-react';

interface ColorButtonProps {
  editor?: Editor | null;
}

const COLORS = [
  '#000000', '#e11d48', '#f59e42', '#fbbf24', '#22c55e', '#0ea5e9', '#6366f1', '#a21caf', '#e5e7eb', '#f1f5f9',
];

export const ColorButton: React.FC<ColorButtonProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState('');

  const applyColor = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setColor(color);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="tiptap-toolbar-btn"
          aria-label="Text color"
          tooltip="Text color"
          style={{ padding: 0 }}
        >
          <Palette className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 grid grid-cols-5 gap-1 bg-white shadow rounded border w-40">
        {COLORS.map((c) => (
          <button
            key={c}
            className="w-6 h-6 rounded-full border border-gray-200 hover:border-blue-400 focus:outline-none"
            style={{ background: c }}
            onClick={() => applyColor(c)}
            aria-label={`Set color ${c}`}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={e => applyColor(e.target.value)}
          className="col-span-5 mt-2 w-full h-8 border rounded"
          aria-label="Custom color"
        />
      </PopoverContent>
    </Popover>
  );
};

export default ColorButton; 