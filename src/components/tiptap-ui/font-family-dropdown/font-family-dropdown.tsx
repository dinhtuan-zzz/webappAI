import React from 'react';
import { Editor } from '@tiptap/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Type } from 'lucide-react';

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'serif' },
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
];

interface FontFamilyDropdownProps {
  editor?: Editor | null;
}

export const FontFamilyDropdown: React.FC<FontFamilyDropdownProps> = ({ editor }) => {
  const current = editor?.getAttributes('textStyle').fontFamily || '';
  const currentLabel = FONT_FAMILIES.find(f => f.value === current)?.label || 'Default';
  const shortLabel = currentLabel.charAt(0);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="tiptap-toolbar-btn"
          aria-label={`Font: ${currentLabel}`}
          tooltip={`Font: ${currentLabel}`}
        >
          <Type className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        className="tiptap-dropdown-menu-content bg-white dark:bg-gray-900 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[140px] max-h-60 overflow-y-auto p-1"
        style={{ backgroundColor: '#fff', zIndex: 9999 }}
      >
        {FONT_FAMILIES.map(f => (
          <DropdownMenuItem
            key={f.value}
            onClick={() => editor?.chain().focus().setFontFamily(f.value).run()}
            role="option"
            aria-selected={current === f.value}
            className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none ${current === f.value ? 'bg-blue-50 font-bold' : ''} hover:bg-gray-100`}
          >
            {current === f.value && (
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            <span style={{ fontFamily: f.value }}>{f.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontFamilyDropdown; 