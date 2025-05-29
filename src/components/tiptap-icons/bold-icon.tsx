import * as React from "react"

export function BoldIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
    <svg viewBox="0 0 18 18" fill="currentColor" stroke="currentColor" {...props}>
      <path d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5V4Z" stroke="currentColor" fill="none" />
      <path d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5V9Z" stroke="currentColor" fill="none" />
      </svg>
  );
  }

BoldIcon.displayName = "BoldIcon"
