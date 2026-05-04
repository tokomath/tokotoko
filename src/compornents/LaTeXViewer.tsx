"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { parse, HtmlGenerator } from 'latex.js';

export default function LaTeXViewer({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!containerRef.current.shadowRoot) {
      containerRef.current.attachShadow({ mode: 'open' });
    }
    
    const shadow = containerRef.current.shadowRoot!;
    shadow.innerHTML = '';
    setHasError(false);

    if (!children || !children.trim()) return;

    try {
      const generator = new HtmlGenerator({ hyphenate: false });
      const doc = parse(children, { generator });
      
      const styles = doc.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/");
      shadow.appendChild(styles);

      const customStyle = document.createElement('style');
      customStyle.textContent = `
        :host {
          display: block;
        }
        p {
          line-height: 2.0 !important;
          overflow: visible !important;
        }
        .body {
          padding-top: 0.5em;
          padding-bottom: 0.5em;
        }
      `;
      shadow.appendChild(customStyle);

      shadow.appendChild(doc.domFragment());
    } catch (error: any) {
      setHasError(true);
    }
  }, [children]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: hasError ? 0 : 1 }}>
      <div ref={containerRef} style={{ display: hasError ? 'none' : 'block' }} />
      {hasError && (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {children}
        </Typography>
      )}
    </Box>
  );
}