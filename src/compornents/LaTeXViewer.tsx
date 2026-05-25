"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { parse, HtmlGenerator } from 'latex.js';

export default function LaTeXViewer({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);

  const content = typeof children === 'string' ? children : String(children || "");

  useEffect(() => {
    const katexGlobalId = 'katex-global';
    if (typeof document !== 'undefined' && !document.getElementById(katexGlobalId)) {
      const link = document.createElement('link');
      link.id = katexGlobalId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    if (!containerRef.current) return;

    if (!containerRef.current.shadowRoot) {
      containerRef.current.attachShadow({ mode: 'open' });
    }

    const shadow = containerRef.current.shadowRoot!;

    if (!content || !content.trim()) {
      shadow.innerHTML = '';
      setHasError(false);
      setErrorMessage("");
      setIsEmpty(true);
      return;
    }

    try {
      const generator = new HtmlGenerator({ hyphenate: false });
      const doc = parse(content, { generator });

      shadow.innerHTML = '';
      setHasError(false);
      setErrorMessage("");

      const katexShadowStyle = document.createElement('link');
      katexShadowStyle.rel = 'stylesheet';
      katexShadowStyle.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      shadow.appendChild(katexShadowStyle);

      const customStyle = document.createElement('style');
      customStyle.textContent = `
        :host {
          display: block;
          max-width: 100%;
        }
        
        .page, .body {
          position: static !important; 
          display: block !important;
          width: auto !important; 
          max-width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        .katex-mathml {
          display: none !important;
        }

        p {
          margin: 0.5em 0;
          line-height: 1.8 !important;
          font-family: "KaTeX_Main", "Times New Roman", "Yu Mincho", serif;
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }

        .katex-display {
          margin: 1em 0 !important;
          overflow-x: auto;
          overflow-y: hidden; 
          max-width: 100%;
        }

        .katex {
          max-width: 100%;
        }
      `;
      
      shadow.appendChild(customStyle);
      
      const fragment = doc.domFragment();
      fragment.querySelectorAll('style').forEach((s : HTMLStyleElement) => s.remove());

      shadow.appendChild(fragment);
      setIsEmpty(false);
    } catch (error: any) {
      setHasError(true);
      setErrorMessage(error?.message);
    }
  }, [content]);

  return (
    <Tooltip
      title={hasError ? errorMessage : ""}
      arrow
      placement="top-start"
      slotProps={{
        tooltip: {
          sx: { fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }
        }
      }}
    >
      <Box
        sx={{
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          overflowY: 'hidden',
          p: hasError ? 1 : 0,
          border: hasError ? '1px solid' : 'none',
          borderColor: hasError ? 'error.light' : 'transparent',
          backgroundColor: hasError ? 'rgba(211, 47, 47, 0.03)' : 'transparent',
          opacity: hasError && !isEmpty ? 0.7 : 1,
          transition: 'all 0.2s ease',
          borderRadius: 1,
          cursor: hasError ? 'help' : 'auto'
        }}
      >
        <div ref={containerRef} style={{ display: isEmpty && hasError ? 'none' : 'block' }} />

        {hasError && isEmpty && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: 'error.main',
              m: 0,
              maxWidth: '100%'
            }}
          >
            {content}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}