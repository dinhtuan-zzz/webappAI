import Image from '@tiptap/extension-image';

const ImageWithWidth = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width') || element.style.width || '100%',
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },
});

export default ImageWithWidth; 