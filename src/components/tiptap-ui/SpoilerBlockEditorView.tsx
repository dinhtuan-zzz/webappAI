import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import './spoiler-block.scss';

const SpoilerBlockEditorView: React.FC = () => {
  return (
    <NodeViewWrapper as="div" className="voz-spoiler voz-spoiler-editable">
      <span className="voz-spoiler-label voz-spoiler-label-edit" style={{ opacity: 0.7, pointerEvents: 'none', userSelect: 'none', display: 'block', marginBottom: '0.3em' }}>
        Spoiler Block (editing)
      </span>
      <div className="voz-spoiler-content" aria-hidden="false" spellCheck={false}>
        <NodeViewContent as="div" />
      </div>
    </NodeViewWrapper>
  );
};

export default SpoilerBlockEditorView; 