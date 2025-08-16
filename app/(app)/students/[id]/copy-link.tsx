"use client";

import { useState } from "react";

interface CopyLinkProps {
  link: string;
  label?: string;
}

export function CopyLink({ link, label = "Copy" }: CopyLinkProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      alert("Could not copy to clipboard. Please copy the link manually.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded transition-colors duration-200 ${
        copySuccess
          ? 'bg-green-600 dark:bg-green-500 text-white'
          : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
      }`}
    >
      {copySuccess ? (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </div>
      ) : (
        label
      )}
    </button>
  );
}
