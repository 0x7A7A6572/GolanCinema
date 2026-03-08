
// Main World Script
// Handles logic that requires access to the page context (e.g. window variables)

const WIN = window as any;

// ================= Site Adapters =================
class BaseAdapter {
  match(url: string): boolean {
    return false;
  }

  preload() {
    // Default no-op
  }

  getVideoUrl(): string {
    return window.location.href;
  }
}

class IqiyiAdapter extends BaseAdapter {
  match(url: string): boolean {
    return url.indexOf('iqiyi.com') > 0;
  }

  preload() {
    try {
      // Accessing window.Q directly since we are in MAIN world
      if (
        WIN.Q &&
        WIN.Q.PageInfo &&
        WIN.Q.PageInfo.playPageInfo &&
        WIN.Q.PageInfo.playPageInfo.albumId !== undefined
      ) {
        const s = document.createElement('script');
        const el = document.getElementsByTagName('script')[0];
        s.async = false;
        s.src =
          document.location.protocol +
          '//cache.video.qiyi.com/jp/avlist/' +
          WIN.Q.PageInfo.playPageInfo.albumId +
          '/1/50/';
        if (el && el.parentNode) el.parentNode.insertBefore(s, el);
      }
    } catch (e) {
      console.error('[Golan Injected] IQIYI Preload Error', e);
    }
  }

  getVideoUrl(): string {
    let currentUrl = window.location.href;
    try {
      const ele = document.querySelectorAll('li[class="item selected"] > span')
        .length
        ? document.querySelectorAll('li[class="item selected"] > span')[1]
        : document.querySelectorAll('li[class="item no selected"] > span')[1];

      if (ele !== undefined) {
        const pd = ele.parentElement?.getAttribute('data-pd');
        // Accessing window.tvInfoJs directly
        if (
          pd &&
          parseInt(pd) > 0 &&
          WIN.tvInfoJs &&
          WIN.tvInfoJs.data &&
          WIN.tvInfoJs.data.vlist
        ) {
          const vinfo = WIN.tvInfoJs.data.vlist[parseInt(pd) - 1];
          if (vinfo && vinfo.vurl && vinfo.vurl.length > 0)
            currentUrl = vinfo.vurl;
        }
      }
    } catch (e) {
      console.error('[Golan Injected] IQIYI Parse Error', e);
    }
    return currentUrl;
  }
}

class SiteAdapterFactory {
  static getAdapter(url: string): BaseAdapter {
    const adapters = [new IqiyiAdapter()];
    for (const adapter of adapters) {
      if (adapter.match(url)) return adapter;
    }
    return new BaseAdapter();
  }
}

// ================= Main Logic =================

function init() {
  const adapter = SiteAdapterFactory.getAdapter(window.location.href);
  adapter.preload();

  // Listen for messages from Content Script (ISOLATED world)
  window.addEventListener('message', (event) => {
    // We expect messages from the content script
    if (event.source !== window) return;

    if (event.data && event.data.type === 'GOLAN_GET_VIDEO_URL_REQUEST') {
      const url = adapter.getVideoUrl();
      window.postMessage(
        {
          type: 'GOLAN_GET_VIDEO_URL_RESPONSE',
          payload: url,
        },
        '*'
      );
    }
  });

  console.log('[Golan Injected] Initialized');
}

init();
