
import { Config } from './config';

export class PlayerManager {
  constructor(private config: Config) {}

  replacePlayer(parserUrl: string, videoUrl: string) {
    const fullUrl = parserUrl + encodeURIComponent(videoUrl);
    const host = window.location.hostname;
    const selectorObj = this.config.siteSelectors.find((s) =>
      host.includes(s.host)
    );

    if (!selectorObj) {
      this.openNewWindow(fullUrl);
      return;
    }

    const playerNode = document.querySelector(selectorObj.selector);
    if (playerNode) {
      const iframe = document.createElement('iframe');
      iframe.src = fullUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      // Ensure iframe has at least 600px height
      iframe.style.minHeight = '600px';
      iframe.style.border = 'none';
      iframe.style.background = 'black';
      iframe.style.zIndex = '9999';
      iframe.style.position = 'absolute';
      iframe.style.border = '2px solid #00d5d3';
      iframe.style.borderRadius = '10px';
      iframe.style.boxShadow = '2px 2px 5px #00d5d3';

      iframe.allow =
        'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');

      playerNode.innerHTML = '';
      playerNode.appendChild(iframe);
    } else {
      if (confirm('未找到视频播放窗口元素，将使用新窗口打开。')) {
        this.openNewWindow(fullUrl);
      }
    }
  }

  openNewWindow(url: string) {
    window.open(url, '_blank');
  }
}
