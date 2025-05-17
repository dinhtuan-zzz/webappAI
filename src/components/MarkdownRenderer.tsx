
"use client";

import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}