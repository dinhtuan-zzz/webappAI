// DEPRECATED: Use spoilerBlock node instead of this inline spoiler mark for all new spoilers. This file is retained for legacy content only.
import { Mark, mergeAttributes } from '@tiptap/core';
import './spoiler-mark.scss';

const Spoiler = Mark.create({
  name: 'spoiler',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.spoiler',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'spoiler' }, this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSpoiler: () => ({ commands }: any) => commands.setMark(this.name),
      toggleSpoiler: () => ({ commands }: any) => commands.toggleMark(this.name),
      unsetSpoiler: () => ({ commands }: any) => commands.unsetMark(this.name),
    } as Partial<any>;
  },
});

export default Spoiler; 