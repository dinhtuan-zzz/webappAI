import { Editor } from '@tiptap/react';

export function isMarkInSchema(type: string, editor?: Editor | null): boolean {
  if (!editor) return false;
  return !!editor.schema.marks[type];
}

export function isNodeInSchema(type: string, editor?: Editor | null): boolean {
  if (!editor) return false;
  return !!editor.schema.nodes[type];
} 