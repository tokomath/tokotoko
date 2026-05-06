"use client"

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { parse, HtmlGenerator } from 'latex.js';

export default function LaTeXViewer({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const katexGlobalId = 'katex-global';
    if (!document.getElementById(katexGlobalId)) {
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
    shadow.innerHTML = '';
    setHasError(false);

    if (!children || !children.trim()) return;

    try {
      const generator = new HtmlGenerator({ hyphenate: false });
      const doc = parse(children, { generator });
      
      const styles = doc.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/");
      shadow.appendChild(styles);

      const katexShadowStyle = document.createElement('link');
      katexShadowStyle.rel = 'stylesheet';
      katexShadowStyle.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      shadow.appendChild(katexShadowStyle);

      const customStyle = document.createElement('style');
      customStyle.textContent = `
        :host, .body {
          display: block;
          font-family: "KaTeX_Main", "Times New Roman", "Yu Mincho", "MS Mincho", serif !important;
        }
        .math, .mord {
          font-family: "KaTeX_Main", "Times New Roman", serif !important;
        }
        .math .mathit, .mord.mathit, .math.italic {
          font-family: "KaTeX_Math", "Times New Roman", serif !important;
          font-style: italic !important;
        }
        .body {
          padding: 0.5em 0;
          font-size: 1.05em;
        }
        p, li {
          line-height: 2.0 !important;
          overflow: visible !important;
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
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '"Yu Mincho", "MS Mincho", serif' }}>
          {children}
        </Typography>
      )}
    </Box>
  );
}