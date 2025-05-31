import React, { useRef, useState, useEffect } from 'react';

interface CollapsibleCommentProps {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
}

export const CollapsibleComment: React.FC<CollapsibleCommentProps> = ({
  children,
  maxHeight = 300,
  className = '',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  }, [children, maxHeight]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={contentRef}
        className="collapsible-comment-content"
        style={{
          maxHeight: expanded ? 'none' : maxHeight,
          overflow: expanded ? 'visible' : 'hidden',
          position: 'relative',
          transition: 'max-height 0.2s',
        }}
      >
        {children}
        {!expanded && isOverflowing && (
          <div className="collapsible-fade-bottom" />
        )}
      </div>
      {!expanded && isOverflowing && (
        <button
          className="collapsible-show-more-btn"
          onClick={() => setExpanded(true)}
          type="button"
        >
          Show more
        </button>
      )}
      {expanded && isOverflowing && (
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