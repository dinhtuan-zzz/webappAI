import React, { useState } from 'react';
import './spoiler-block.scss';

export const SpoilerBlockReact: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="voz-spoiler"
      data-revealed={revealed ? 'true' : 'false'}
      aria-expanded={revealed}
      tabIndex={0}
      role="button"
      spellCheck={false}
    >
      {!revealed && (
        <span
          className="voz-spoiler-label"
          tabIndex={0}
          aria-hidden="false"
          spellCheck={false}
          onClick={() => setRevealed(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setRevealed(true);
            }
          }}
        >
          Show Spoiler
        </span>
      )}
      <div
        className="voz-spoiler-content"
        spellCheck={false}
        style={{ display: revealed ? 'block' : 'none' }}
      >
        {children}
        <span
          className="voz-spoiler-hide-btn"
          tabIndex={0}
          role="button"
          aria-label="Hide Spoiler"
          style={{ display: revealed ? 'inline-block' : 'none' }}
          onClick={() => setRevealed(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setRevealed(false);
            }
          }}
        >
          Hide Spoiler
        </span>
      </div>
    </div>
  );
}; 