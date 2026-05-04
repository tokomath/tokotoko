"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { parse, HtmlGenerator } from 'latex.js';

export default function LaTeXViewer({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!containerRef.current.shadowRoot) {
      containerRef.current.attachShadow({ mode: 'open' });
    }
    
    const shadow = containerRef.current.shadowRoot!;
    shadow.innerHTML = '';
    setErrorMsg(null);

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
      setErrorMsg(error.message);
    }
  }, [children]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <div ref={containerRef} />
      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
          {errorMsg}
        </Typography>
      )}
    </Box>
  );
}