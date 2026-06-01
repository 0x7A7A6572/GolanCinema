
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

      // tips: close iframe if user refresh page
      const closeTip = document.createElement('div');

      closeTip.style.textAlign = 'center';
      closeTip.style.fontSize = '12px';
      closeTip.style.marginTop = '8px';
      closeTip.style.position = 'absolute';
      closeTip.style.top = '-28px';
      closeTip.style.left = '20px';
      closeTip.style.backgroundColor = 'rgb(77 135 135 / 65%)';
      closeTip.style.padding = '2px 6px';
      closeTip.style.color = 'rgb(229 229 229 / 60%)';
      closeTip.style.borderRadius = '5px';
      closeTip.style.zIndex = '9999';
      closeTip.style.borderBottomLeftRadius = '0';
      closeTip.style.borderBottomRightRadius = '0';
      closeTip.innerHTML = '如需关闭内嵌窗口，请刷新页面；如视频长时间无法加载，请尝试切换接口';
      playerNode.appendChild(closeTip);

      // 全屏按钮
      const fullscreenBtn = document.createElement('button');
      // fullscreenBtn.innerText = ' 全屏';
      fullscreenBtn.style.position = 'absolute';
      fullscreenBtn.style.bottom = '-20px';
      fullscreenBtn.style.left = '20px';
      fullscreenBtn.style.backgroundColor = '#00ffff9e';
      fullscreenBtn.style.padding = '2px 6px';
      fullscreenBtn.style.color = '#000000b8';
      fullscreenBtn.style.borderRadius = '5px';
      fullscreenBtn.style.borderTopLeftRadius = '0';
      fullscreenBtn.style.borderTopRightRadius = '0';
      fullscreenBtn.style.cursor = 'pointer';
      fullscreenBtn.style.zIndex = '9999';
      fullscreenBtn.style.display = 'flex';
      fullscreenBtn.style.alignItems = 'center';
      fullscreenBtn.style.justifyContent = 'center';

      // full icon svg
      const icon = document.createElement('img');
      icon.src = 'data:image/svg+xml,' + encodeURIComponent('<svg t="1780321702632" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6791" width="128" height="128"><path d="M213.333333 85.333333C143.146667 85.333333 85.333333 143.146667 85.333333 213.333333v85.333334a42.666667 42.666667 0 0 0 42.666667 42.666666 42.666667 42.666667 0 0 0 42.666667-42.666666V213.333333c0-24.064 18.602667-42.666667 42.666666-42.666666h85.333334a42.666667 42.666667 0 0 0 42.666666-42.666667 42.666667 42.666667 0 0 0-42.666666-42.666667zM725.333333 85.333333a42.666667 42.666667 0 0 0-42.666666 42.666667 42.666667 42.666667 0 0 0 42.666666 42.666667h85.333334c24.064 0 42.666667 18.602667 42.666666 42.666666v85.333334a42.666667 42.666667 0 0 0 42.666667 42.666666 42.666667 42.666667 0 0 0 42.666667-42.666666V213.333333c0-70.186667-57.813333-128-128-128zM896 682.666667a42.666667 42.666667 0 0 0-42.666667 42.666666v85.333334c0 24.064-18.602667 42.666667-42.666666 42.666666h-85.333334a42.666667 42.666667 0 0 0-42.666666 42.666667 42.666667 42.666667 0 0 0 42.666666 42.666667h85.333334c70.186667 0 128-57.813333 128-128v-85.333334a42.666667 42.666667 0 0 0-42.666667-42.666666zM128 682.666667a42.666667 42.666667 0 0 0-42.666667 42.666666v85.333334c0 70.186667 57.813333 128 128 128h85.333334a42.666667 42.666667 0 0 0 42.666666-42.666667 42.666667 42.666667 0 0 0-42.666666-42.666667H213.333333c-24.064 0-42.666667-18.602667-42.666666-42.666666v-85.333334a42.666667 42.666667 0 0 0-42.666667-42.666666zM341.333333 298.666667c-46.506667 0-85.333333 38.826667-85.333333 85.333333v256c0 46.506667 38.826667 85.333333 85.333333 85.333333h341.333334c46.506667 0 85.333333-38.826667 85.333333-85.333333V384c0-46.506667-38.826667-85.333333-85.333333-85.333333z m0 85.333333h341.333334v256H341.333333z" p-id="6792"></path></svg>');
      icon.style.width = '18px';
      icon.style.height = '18px';
      fullscreenBtn.appendChild(icon);
      const ftext = document.createElement('span');
      ftext.innerText = ' 全屏';
      ftext.style.lineHeight = '18px';
      ftext.style.fontSize = '12px';
      ftext.style.marginLeft = '4px';
      fullscreenBtn.appendChild(ftext);


      playerNode.appendChild(fullscreenBtn);

      fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          iframe.requestFullscreen();
        }
      });

      // document.addEventListener('fullscreenchange', () => {
      //   // fullscreenBtn.innerText = document.fullscreenElement ? '退出全屏' : '全屏';
      // });

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
