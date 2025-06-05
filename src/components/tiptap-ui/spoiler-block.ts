import { Node, mergeAttributes } from '@tiptap/core';
import './spoiler-block.scss';
import { wrapIn, lift } from 'prosemirror-commands';
import { findParentNode } from 'prosemirror-utils';
import type { RawCommands, CommandProps } from '@tiptap/core';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SpoilerBlockEditorView from './SpoilerBlockEditorView';

const SpoilerBlock = Node.create({
  name: 'spoilerBlock',
  group: 'block',
  content: 'block+',
  selectable: true,
  draggable: false,
  addAttributes() {
    return {
      revealed: {
        default: false,
        parseHTML: element => element.getAttribute('data-revealed') === 'true',
        renderHTML: attributes => ({ 'data-revealed': attributes.revealed ? 'true' : 'false' }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(SpoilerBlockEditorView);
  },
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: element => (element as HTMLElement).classList.contains('voz-spoiler') ? {} : false,
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const revealed = node.attrs.revealed;
    // Only handle read-only rendering here; editor uses NodeView
    return [
      'div',
      mergeAttributes({
        class: 'voz-spoiler',
        tabindex: 0,
        role: 'button',
        'aria-expanded': revealed ? 'true' : 'false',
        spellcheck: 'false',
        'data-editable': 'false',
        'data-revealed': revealed ? 'true' : 'false',
      }, HTMLAttributes),
      ['span', { class: 'voz-spoiler-label', 'aria-hidden': revealed ? 'true' : 'false', spellcheck: 'false', style: revealed ? 'display:none;' : '' }, 'Show Spoiler'],
      ['div', { class: 'voz-spoiler-content', spellcheck: 'false', style: revealed ? '' : 'display:none;' }, 0],
      ['span', { class: 'voz-spoiler-hide-btn', tabindex: 0, role: 'button', 'aria-label': 'Hide Spoiler', style: revealed ? '' : 'display:none;' }, 'Hide Spoiler'],
    ];
  },
  addCommands() {
    return {
      toggleSpoilerBlock:
        () =>
        ({ state, dispatch, chain, commands }: { state: EditorState; dispatch: any; chain: any; commands: RawCommands }) => {
          const { selection, doc } = state;
          // 1. If the document is empty, insert a paragraph and move selection into it, then return true
          if (doc.childCount === 0 || doc.content.size === 0) {
            const paragraphType = state.schema.nodes.paragraph;
            if (paragraphType) {
              let tr = state.tr.insert(0, paragraphType.create());
              tr = tr.setSelection(TextSelection.near(tr.doc.resolve(1)));
              if (dispatch) dispatch(tr);
              return true;
            }
          }
          const parent = findParentNode((node: ProseMirrorNode) => node.type.name === 'spoilerBlock')(selection);
          if (parent) {
            return commands.lift('spoilerBlock');
          }
          // If selection is at the very start of the document and not inside a paragraph, insert a paragraph above
          if (
            selection.$from.pos === 0 ||
            (selection.$from.parentOffset === 0 && selection.$from.depth === 1 && selection.$from.index(0) === 0)
          ) {
            // Insert an empty paragraph at the top
            const paragraphType = state.schema.nodes.paragraph;
            if (paragraphType) {
              let tr = state.tr.insert(0, paragraphType.create());
              // Move selection into the new paragraph
              tr = tr.setSelection(TextSelection.near(tr.doc.resolve(1)));
              if (dispatch) dispatch(tr);
              return true;
            }
          }
          // Only wrap if allowed: selection must be a TextSelection inside a single paragraph
          if (
            selection instanceof TextSelection &&
            selection.$from.parent.type.name === 'paragraph' &&
            selection.$from.parent === selection.$to.parent
          ) {
            return commands.wrapIn('spoilerBlock');
          }
          return false;
        },
      toggleSpoilerReveal:
        (revealed: boolean) =>
        ({ state, dispatch, commands }: { state: EditorState; dispatch: any; commands: RawCommands }) => {
          const { selection } = state;
          const parent = findParentNode((node: ProseMirrorNode) => node.type.name === 'spoilerBlock')(selection);
          if (parent) {
            const { pos, node } = parent;
            if (dispatch) {
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                revealed,
              });
              dispatch(tr);
            }
            return true;
          }
          return false;
        },
    } as Partial<RawCommands>;
  },
});

export default SpoilerBlock; 