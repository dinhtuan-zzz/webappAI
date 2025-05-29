import { Editor } from '@tiptap/react';
 
export function useTiptapEditor(editor?: Editor | null): Editor | null {
  return editor ?? null;
} 