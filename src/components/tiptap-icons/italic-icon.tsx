import * as React from "react"

export function ItalicIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
    <svg viewBox="0 0 18 18" fill="currentColor" stroke="currentColor" {...props}>
      <line x1="7" x2="13" y1="4" y2="4" stroke="currentColor" fill="none" />
      <line x1="5" x2="11" y1="14" y2="14" stroke="currentColor" fill="none" />
      <line x1="8" x2="10" y1="14" y2="4" stroke="currentColor" fill="none" />
      </svg>
  );
  }

ItalicIcon.displayName = "ItalicIcon"
