import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu';
import { List, ListOrdered, ListChecks, Check } from 'lucide-react';

interface ListButtonsProps {
  editor?: Editor | null;
}

export const ListButtons: React.FC<ListButtonsProps> = ({ editor }) => {
  if (!editor) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" aria-label="Lists" className="tiptap-toolbar-btn" tooltip="Lists">
          <List className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="tiptap-dropdown-menu-content bg-white dark:bg-gray-900 shadow-lg rounded border border-gray-200 dark:border-gray-700 w-auto min-w-fit max-w-xs max-h-60 overflow-y-auto p-1"
        style={{ backgroundColor: '#fff', zIndex: 9999 }}
      >
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor}
          className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-blue-50 font-bold' : ''}`}
        >
          {editor.isActive('bulletList') && <Check className="w-4 h-4 mr-2 text-blue-500" />}
          <span aria-label="Bullet List" className="flex items-center gap-2">
            <List className="tiptap-button-icon" />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
          className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-blue-50 font-bold' : ''}`}
        >
          {editor.isActive('orderedList') && <Check className="w-4 h-4 mr-2 text-blue-500" />}
          <span aria-label="Ordered List" className="flex items-center gap-2">
            <ListOrdered className="tiptap-button-icon" />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          disabled={!editor}
          className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none hover:bg-gray-100 ${editor.isActive('taskList') ? 'bg-blue-50 font-bold' : ''}`}
        >
          {editor.isActive('taskList') && <Check className="w-4 h-4 mr-2 text-blue-500" />}
          <span aria-label="Checklist" className="flex items-center gap-2">
            <ListChecks className="tiptap-button-icon" />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ListButtons; 