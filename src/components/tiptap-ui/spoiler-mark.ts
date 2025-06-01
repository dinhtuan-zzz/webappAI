import { Mark, mergeAttributes } from '@tiptap/core';

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