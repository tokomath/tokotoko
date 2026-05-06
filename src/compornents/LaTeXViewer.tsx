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
          width: 100%;
        }
        
        /* latex.jsが生成するコンテナの絶対配置を解除し、通常のブロック要素に戻す */
        .page, .body {
          position: static !important; 
          display: block !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* テキストのスタイルと、十分な行高の確保 */
        p {
          margin: 0.5em 0;
          line-height: 1.8 !important;
          font-family: "KaTeX_Main", "Times New Roman", "Yu Mincho", serif;
          word-wrap: break-word;
        }

        /* ディスプレイ数式（$$）の上下の余白 */
        .katex-display {
          margin: 1em 0 !important;
          overflow-x: auto;
          overflow-y: hidden;
        }
      `;
      shadow.appendChild(customStyle);

      shadow.appendChild(doc.domFragment());
      setIsEmpty(false);
    } catch (error: any) {
      setHasError(true);
      setErrorMessage(error?.message || "パースエラーが発生しました");
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
          width: '100%',
          overflowX: 'auto',
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
              wordBreak: 'break-word',
              color: 'error.main',
              p: 1
            }}
          >
            {content}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}