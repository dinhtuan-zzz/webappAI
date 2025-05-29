import * as React from "react"

export function UnderlineIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
    <svg viewBox="0 0 18 18" fill="currentColor" stroke="currentColor" {...props}>
      <path d="M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3" stroke="currentColor" fill="none" />
      <rect height="1" rx="0.5" ry="0.5" width="12" x="3" y="15" fill="currentColor" stroke="none" />
      </svg>
  );
  }

UnderlineIcon.displayName = "UnderlineIcon"
