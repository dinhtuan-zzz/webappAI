import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/tiptap-ui-primitive/popover/popover';
import { Button } from '@/components/tiptap-ui-primitive/button/button';

interface EmojiButtonProps {
  editor?: Editor | null;
}

export const EmojiButton: React.FC<EmojiButtonProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji.native).run();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" aria-label="Emoji" className="tiptap-toolbar-btn">
          <span role="img" aria-label="emoji">😊</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white shadow-lg rounded border w-72">
        <Picker data={data} onEmojiSelect={handleSelect} theme="light" previewPosition="none" skinTonePosition="none" />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiButton; 