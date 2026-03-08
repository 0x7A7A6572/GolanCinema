
// Bridge to communicate with Main World script

export function getVideoUrlFromMainWorld(): Promise<string> {
  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data && event.data.type === 'GOLAN_GET_VIDEO_URL_RESPONSE') {
        window.removeEventListener('message', handler);
        resolve(event.data.payload);
      }
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: 'GOLAN_GET_VIDEO_URL_REQUEST' }, '*');

    // Timeout fallback
    setTimeout(() => {
      window.removeEventListener('message', handler);
      // Fallback to current location if main world script doesn't respond
      resolve(window.location.href);
    }, 1000);
  });
}
