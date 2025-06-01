import React from 'react';
import { Editor } from '@tiptap/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { Text } from 'lucide-react';

const FONT_SIZES = [
  { label: 'Default', value: '' },
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Extra Large', value: '24px' },
  { label: 'Huge', value: '32px' },
];

interface FontSizeDropdownProps {
  editor?: Editor | null;
}

export const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({ editor }) => {
  const current = editor?.getAttributes('textStyle').fontSize || '';
  const currentObj = FONT_SIZES.find(f => f.value === current) || FONT_SIZES[0];
  const currentLabel = currentObj.label;
  const shortLabel = currentLabel.charAt(0);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="tiptap-toolbar-btn"
          aria-label={`Size: ${currentLabel}`}
          tooltip={`Size: ${currentLabel}`}
        >
          <Text className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        className="tiptap-dropdown-menu-content bg-white dark:bg-gray-900 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[140px] max-h-60 overflow-y-auto p-1"
        style={{ backgroundColor: '#fff', zIndex: 9999 }}
      >
        {FONT_SIZES.map(f => (
          <DropdownMenuItem
            key={f.value}
            onClick={() => editor?.chain().focus().setFontSize(f.value).run()}
            role="option"
            aria-selected={current === f.value}
            className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none ${current === f.value ? 'bg-blue-50 font-bold' : ''} hover:bg-gray-100`}
          >
            {current === f.value && (
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            <span style={{ fontSize: f.value || '16px' }}>{f.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontSizeDropdown; 