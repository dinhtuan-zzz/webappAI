import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/tiptap-ui-primitive/popover/popover';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Palette, Eraser } from 'lucide-react';
import './color-button.scss';

interface ColorButtonProps {
  editor?: Editor | null;
}

const PALETTE = [
  '#000000', '#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4',
  '#e11d48', '#f59e42', '#fbbf24', '#22c55e', '#0ea5e9', '#6366f1', '#a21caf',
  '#e5e7eb', '#f1f5f9', '#ffffff', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff',
];

export const ColorButton: React.FC<ColorButtonProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState('');
  const [hex, setHex] = useState('');
  const [hexValid, setHexValid] = useState(true);
  const [resetFlash, setResetFlash] = useState(false);
  const hexInputRef = useRef<HTMLInputElement>(null);

  const isHex = (val: string) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(val);
  const normalizeHex = (val: string) => {
    if (val.startsWith('#')) return val;
    if (/^[0-9A-Fa-f]{3,6}$/.test(val)) return '#' + val;
    return val;
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = normalizeHex(val);
    setHex(val);
    setHexValid(isHex(val));
  };

  const applyColor = (colorValue: string) => {
    if (editor) {
      editor.chain().focus().setColor(colorValue).run();
      setColor(colorValue);
      setHex(colorValue);
      setOpen(false);
    }
  };

  // When popover opens, sync hex input to current color
  React.useEffect(() => {
    if (open) {
      setHex(color || '');
    }
  }, [open, color]);

  const handleHexOk = () => {
    if (hex.length === 0) {
      // Do nothing if input is empty (keep current color)
      setOpen(false);
      return;
    }
    if (isHex(hex)) {
      applyColor(hex);
    }
  };

  const handleReset = () => {
    if (editor) {
      editor.chain().focus().setColor('').run();
      setColor('');
      setHex('');
      setOpen(false);
      setResetFlash(true);
      setTimeout(() => setResetFlash(false), 300);
    }
  };

  // Keyboard navigation
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cols = 7; // number of columns in the swatch grid
  const handleSwatchKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      applyColor(PALETTE[idx]);
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      swatchRefs.current[(idx + 1) % PALETTE.length]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
      swatchRefs.current[(idx - 1 + PALETTE.length) % PALETTE.length]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      const next = (idx + cols) % PALETTE.length;
      swatchRefs.current[next]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
      const prev = (idx - cols + PALETTE.length) % PALETTE.length;
      swatchRefs.current[prev]?.focus();
      e.preventDefault();
    }
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
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
      <PopoverContent
        className={`color-picker-popover hand-drawn${resetFlash ? ' reset-flash' : ''}`}
        style={{ minWidth: 220, maxWidth: 320 }}
        tabIndex={-1}
        onKeyDown={handlePopoverKeyDown}
        role="dialog"
        aria-label="Color picker dialog"
      >
        <div className="color-swatch-grid" role="listbox" aria-label="Color palette">
          {PALETTE.map((c, i) => (
            <button
              key={c}
              ref={el => { swatchRefs.current[i] = el; }}
              className={`color-swatch${color === c ? ' selected hand-drawn' : ''}`}
              style={{ background: c }}
              onClick={() => applyColor(c)}
              onKeyDown={e => handleSwatchKeyDown(e, i)}
              aria-label={`Set color ${c}`}
              aria-selected={color === c}
              tabIndex={0}
              role="option"
            />
          ))}
        </div>
        <div className="hex-input-row">
          <span
            className="hex-preview"
            aria-label="HEX color preview"
            style={{
              background: hexValid && isHex(hex) ? hex : (color || '#fff'),
              marginRight: 8
            }}
          />
          <input
            ref={hexInputRef}
            className={`hex-input${!hexValid ? ' invalid' : ''}`}
            value={hex}
            onChange={handleHexChange}
            placeholder="#HEX"
            aria-label="HEX Color"
            maxLength={7}
            tabIndex={0}
            style={{ borderColor: hexValid ? '#111' : '#e11d48' }}
          />
          <button
            type="button"
            className="ok-btn"
            onClick={handleHexOk}
            aria-label="Apply HEX color"
            disabled={!hexValid && hex.length > 0}
            tabIndex={0}
          >
            OK
          </button>
          <button className="reset-btn" onClick={handleReset} title="Reset color" aria-label="Reset color" tabIndex={0}>
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorButton; 