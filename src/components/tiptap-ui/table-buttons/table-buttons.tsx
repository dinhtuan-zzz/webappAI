import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu';
import { Tooltip } from '@/components/ui/Tooltip';
import { Table, Plus, PlusSquare, X } from 'lucide-react';

interface TableButtonsProps {
  editor?: Editor | null;
}

export const TableButtons: React.FC<TableButtonsProps> = ({ editor }) => {
  if (!editor) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" aria-label="Table" className="tiptap-toolbar-btn" tooltip="Table">
          <Table className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          disabled={!editor.can().insertTable?.({ rows: 3, cols: 3, withHeaderRow: true })}
        >
          <span aria-label="Insert Table" className="flex items-center gap-2">
            <Table className="tiptap-button-icon" /> Insert Table
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter?.()}
        >
          <span aria-label="Add Row After" className="flex items-center gap-2">
            <Plus className="tiptap-button-icon" /> Add Row After
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter?.()}
        >
          <span aria-label="Add Column After" className="flex items-center gap-2">
            <PlusSquare className="tiptap-button-icon" /> Add Column After
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable?.()}
        >
          <span aria-label="Delete Table" className="flex items-center gap-2">
            <X className="tiptap-button-icon" /> Delete Table
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableButtons; 