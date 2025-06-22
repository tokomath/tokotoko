import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const DynamicIframe = ({ srcDoc }: { srcDoc: string }) => {
  srcDoc += "<script>function sendHeight() {const height = document.documentElement.scrollHeight;window.parent.postMessage({ type: 'setHeight', height: height }, '*');}window.addEventListener('load', sendHeight);window.addEventListener('resize', sendHeight);</script>";

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(100); // 初期高さ

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // iframe の contentWindow と送信元が一致するか確認
      if (
        event.data?.type === 'setHeight' &&
        iframeRef.current &&
        event.source === iframeRef.current.contentWindow
      ) {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Box>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        style={{ width: '100%', height: iframeHeight, border: 'none' }}
        title="dynamic-iframe"
      />
    </Box>
  );
};

export default DynamicIframe;