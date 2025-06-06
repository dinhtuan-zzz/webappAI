import React, { useRef, useState, useEffect, cloneElement, isValidElement, ReactNode } from 'react';
import { SpoilerBlockReact } from './tiptap-ui/SpoilerBlockReact';

interface CollapsibleCommentProps {
  children: (injectOnToggle: (el: React.ReactElement, path: string) => ReactNode) => ReactNode;
  maxHeight?: number;
  className?: string;
}

function hasChildrenProp(props: any): props is { children: React.ReactNode } {
  return props && Object.prototype.hasOwnProperty.call(props, 'children');
}

// Helper to detect if any child is a SpoilerBlockReact
function isSpoilerBlockElement(element: any): boolean {
  if (!isValidElement(element)) return false;
  const type = element.type;
  return (
    type === SpoilerBlockReact ||
    (typeof type === 'function' && ((type as any).displayName === 'SpoilerBlockReact' || (type as any).name === 'SpoilerBlockReact')) ||
    (typeof type === 'object' && type && 'displayName' in type && (type as any).displayName === 'SpoilerBlockReact')
  );
}

function containsSpoiler(node: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(node, child => {
    if (isValidElement(child)) {
      if (isSpoilerBlockElement(child)) {
        found = true;
      } else if ('props' in child && hasChildrenProp(child.props)) {
        if (containsSpoiler(child.props.children)) found = true;
      }
    }
  });
  return found;
}

export const CollapsibleComment: React.FC<CollapsibleCommentProps> = ({
  children,
  maxHeight = 300,
  className = '',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<{ [id: string]: boolean }>({});
  const [pendingSpoilerReveal, setPendingSpoilerReveal] = useState<string | null>(null);
  const [allowSpoilerReveal, setAllowSpoilerReveal] = useState<string | null>(null);

  useEffect(() => {
    setHasSpoiler(containsSpoiler(children));
  }, [children]);

  const measureOverflow = () => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  };

  useEffect(() => {
    measureOverflow();
    // eslint-disable-next-line
  }, [children, maxHeight, Object.values(revealedSpoilers).filter(Boolean).length]);

  useEffect(() => {
    if (pendingSpoilerReveal) {
      console.log('[CollapsibleComment] pendingSpoilerReveal:', pendingSpoilerReveal);
      setTimeout(() => {
        setAllowSpoilerReveal(pendingSpoilerReveal);
        console.log('[CollapsibleComment] allowSpoilerReveal set:', pendingSpoilerReveal);
        setTimeout(() => {
          setRevealedSpoilers(prev => {
            console.log('[CollapsibleComment] setRevealedSpoilers:', { ...prev, [pendingSpoilerReveal]: true });
            return { ...prev, [pendingSpoilerReveal]: true };
          });
          setAllowSpoilerReveal(null);
        }, 0);
      }, 0);
      setPendingSpoilerReveal(null);
    }
  }, [pendingSpoilerReveal]);

  const handleSpoilerToggle = (id: string, revealed: boolean) => {
    console.log('[CollapsibleComment] handleSpoilerToggle:', id, revealed);
    setRevealedSpoilers(prev => ({ ...prev, [id]: revealed }));
    setTimeout(measureOverflow, 50);
  };

  const handleRequestSpoilerReveal = (id: string) => {
    console.log('[CollapsibleComment] handleRequestSpoilerReveal:', id);
    setPendingSpoilerReveal(id);
  };

  function injectOnToggle(node: React.ReactElement, path: string = '0'): React.ReactNode {
    if (isValidElement(node)) {
      // Debug: log type and props for every node
      const type = node.type;
      const displayName = (type as any).displayName;
      const name = (type as any).name;
      console.log('[CollapsibleComment] injectOnToggle node', {
        path,
        type,
        displayName,
        name,
        props: node.props,
      });
      if (isSpoilerBlockElement(node)) {
        const spoilerId = `spoiler-${path}`;
        console.log('[CollapsibleComment] injectOnToggle:', spoilerId, {
          revealed: allowSpoilerReveal === spoilerId || !!revealedSpoilers[spoilerId],
          allowSpoilerReveal,
          revealedSpoilers,
        });
        return cloneElement(node as React.ReactElement<any>, {
          onToggle: (revealed: boolean) => handleSpoilerToggle(spoilerId, revealed),
          onRequestReveal: () => handleRequestSpoilerReveal(spoilerId),
          revealed: allowSpoilerReveal === spoilerId || !!revealedSpoilers[spoilerId],
          spoilerId,
          key: spoilerId,
        } as any);
      }
      if ('props' in node && hasChildrenProp(node.props)) {
        return cloneElement(node as React.ReactElement<any>, {
          children: React.Children.map(node.props.children, (child, i) => injectOnToggle(child, `${path}-${i}`)),
        } as any);
      }
    }
    return node;
  }

  const anySpoilerRevealed = Object.values(revealedSpoilers).some(Boolean);
  const shouldShowOverflow = (!hasSpoiler || anySpoilerRevealed) && isOverflowing;
  const parentMaxHeight = anySpoilerRevealed ? 'none' : (expanded ? 'none' : maxHeight);
  const parentOverflow = anySpoilerRevealed ? 'visible' : (expanded ? 'visible' : 'hidden');

  return (
    <div className={`relative ${className}`}>
      <div
        ref={contentRef}
        className="collapsible-comment-content"
        style={{
          maxHeight: parentMaxHeight,
          overflow: parentOverflow,
          position: 'relative',
          transition: 'max-height 0.2s',
        }}
      >
        {children(injectOnToggle)}
        {!expanded && shouldShowOverflow && !anySpoilerRevealed && (
          <div className="collapsible-fade-bottom" />
        )}
      </div>
      {!expanded && shouldShowOverflow && !anySpoilerRevealed && (
        <button
          className="collapsible-show-more-btn"
          onClick={() => setExpanded(true)}
          type="button"
        >
          Show more
        </button>
      )}
      {expanded && shouldShowOverflow && !anySpoilerRevealed && (
        <button
          className="collapsible-show-more-btn"
          onClick={() => setExpanded(false)}
          type="button"
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default CollapsibleComment;