import React, { useState, useRef, useEffect } from 'react';
import './spoiler-block.scss';

const SPOILER_MAX_HEIGHT = 300;

export const SpoilerBlockReact: React.FC<{
  children: React.ReactNode;
  onToggle?: (revealed: boolean) => void;
  revealed?: boolean;
  onRequestReveal?: () => void;
  spoilerId?: string;
}> = ({ children, onToggle, revealed: controlledRevealed, onRequestReveal, spoilerId }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Debug: log on each render
  console.log('[SpoilerBlockReact] render', { spoilerId, controlledRevealed });

  // Use ResizeObserver to measure overflow after any layout change
  useEffect(() => {
    if (!controlledRevealed || !contentRef.current) return;
    const measureOverflow = () => {
      if (contentRef.current) {
        setIsOverflowing(contentRef.current.scrollHeight > SPOILER_MAX_HEIGHT);
      }
    };
    measureOverflow();
    const observer = new (window as any).ResizeObserver(measureOverflow);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [controlledRevealed, children]);

  const handleReveal = () => {
    console.log('[SpoilerBlockReact] handleReveal', { spoilerId });
    if (onRequestReveal) {
      onRequestReveal();
    }
    onToggle?.(true);
  };
  const handleHide = () => {
    console.log('[SpoilerBlockReact] handleHide', { spoilerId });
    onToggle?.(false);
    setExpanded(false);
  };

  return (
    <div
      className="voz-spoiler"
      data-revealed={controlledRevealed ? 'true' : 'false'}
      aria-expanded={controlledRevealed}
      tabIndex={0}
      role="button"
      spellCheck={false}
      data-spoiler-id={spoilerId}
    >
      {!controlledRevealed && (
        <span
          className="voz-spoiler-label"
          tabIndex={0}
          aria-hidden="false"
          spellCheck={false}
          onClick={handleReveal}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleReveal();
            }
          }}
        >
          Show Spoiler
        </span>
      )}
      <div
        className="voz-spoiler-content"
        spellCheck={false}
        style={{ display: controlledRevealed ? 'block' : 'none' }}
      >
        <div
          ref={contentRef}
          style={{
            maxHeight: controlledRevealed && !expanded ? SPOILER_MAX_HEIGHT : 'none',
            overflow: controlledRevealed && !expanded ? 'hidden' : 'visible',
            position: 'relative',
            transition: 'max-height 0.2s',
          }}
        >
          {children}
          {controlledRevealed && !expanded && isOverflowing && (
            <div className="collapsible-fade-bottom" />
          )}
        </div>
        {controlledRevealed && isOverflowing && !expanded && (
          <button
            className="collapsible-show-more-btn"
            onClick={() => setExpanded(true)}
            type="button"
          >
            Show more
          </button>
        )}
        {controlledRevealed && isOverflowing && expanded && (
          <button
            className="collapsible-show-more-btn"
            onClick={() => setExpanded(false)}
            type="button"
          >
            Show less
          </button>
        )}
        <span
          className="voz-spoiler-hide-btn"
          tabIndex={0}
          role="button"
          aria-label="Hide Spoiler"
          style={{ display: controlledRevealed ? 'inline-block' : 'none' }}
          onClick={handleHide}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleHide();
            }
          }}
        >
          Hide Spoiler
        </span>
      </div>
    </div>
  );
}; 