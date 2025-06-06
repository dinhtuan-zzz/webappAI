import React from 'react';
import { SpoilerBlockReact } from './SpoilerBlockReact';

// Helper to render text marks (bold, italic, underline, etc.)
function renderMarks(text: string, marks: any[] = []) {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>;
      case 'italic':
        return <em>{acc}</em>;
      case 'underline':
        return <u>{acc}</u>;
      case 'strike':
        return <s>{acc}</s>;
      case 'code':
        return <code>{acc}</code>;
      case 'link':
        return (
          <a href={mark.attrs?.href} target="_blank" rel="noopener noreferrer">
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: any, key?: React.Key, injectOnToggle?: (el: React.ReactElement, path: string) => React.ReactNode, path: string = '0'): React.ReactNode {
  if (!node) return null;
  switch (node.type) {
    case 'doc':
      return <>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</>;
    case 'paragraph':
      return <p key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</p>;
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' && node.attrs.level >= 1 && node.attrs.level <= 6 ? node.attrs.level : 1;
      const Tag = `h${level}`;
      return React.createElement(Tag, { key }, node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`)));
    }
    case 'bulletList':
      return <ul key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</ul>;
    case 'orderedList':
      return <ol key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</ol>;
    case 'listItem':
      return <li key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</li>;
    case 'blockquote':
      return <blockquote key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</blockquote>;
    case 'codeBlock':
      return (
        <pre key={key}>
          <code>{node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}</code>
        </pre>
      );
    case 'image':
      return <img key={key} src={node.attrs?.src} alt={node.attrs?.alt || ''} style={{ maxWidth: '100%' }} />;
    case 'horizontalRule':
      return <hr key={key} />;
    case 'spoilerBlock': {
      const spoiler = (
        <SpoilerBlockReact key={key}>
          {node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`))}
        </SpoilerBlockReact>
      );
      return injectOnToggle ? injectOnToggle(spoiler, path) : spoiler;
    }
    case 'text':
      return renderMarks(node.text, node.marks);
    case 'hardBreak':
      return <br key={key} />;
    default:
      return node.content?.map((child: any, i: number) => renderNode(child, i, injectOnToggle, `${path}-${i}`)) || null;
  }
}

export const TiptapJsonRenderer: React.FC<{ content: any; injectOnToggle?: (el: React.ReactElement, path: string) => React.ReactNode }> = ({ content, injectOnToggle }) => {
  return <div className="prose prose-editor tiptap-editor max-w-none mb-2 comment-readonly">{renderNode(content, undefined, injectOnToggle)}</div>;
}; 