import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  options_page: 'src/options/index.html',
  content_scripts: [
    {
      js: ['src/content/main.ts'],
      matches: [
        '*://*.iqiyi.com/v_*',
        '*://v.youku.com/*',
        '*://*.le.com/*',
        '*://v.qq.com/*',
        '*://*.tudou.com/*',
        '*://*.mgtv.com/*',
        '*://film.sohu.com/*',
        '*://*.acfun.cn/v/*',
        '*://*.bilibili.com/*',
        '*://vip.1905.com/play/*',
        '*://vip.pptv.com/show/*',
        '*://v.yinyuetai.com/video/*',
        '*://v.yinyuetai.com/playlist/*',
        '*://*.fun.tv/vplay/*',
        '*://*.wasu.cn/Play/show/*',
      ],
      run_at: 'document_end',
    },
    {
      js: ['src/injected/main.ts'],
      matches: [
        '*://*.iqiyi.com/v_*',
        '*://v.youku.com/*',
        '*://*.le.com/*',
        '*://v.qq.com/*',
        '*://*.tudou.com/*',
        '*://*.mgtv.com/*',
        '*://film.sohu.com/*',
        '*://*.acfun.cn/v/*',
        '*://*.bilibili.com/*',
        '*://vip.1905.com/play/*',
        '*://vip.pptv.com/show/*',
        '*://v.yinyuetai.com/video/*',
        '*://v.yinyuetai.com/playlist/*',
        '*://*.fun.tv/vplay/*',
        '*://*.wasu.cn/Play/show/*',
      ],
      run_at: 'document_start',
      world: 'MAIN',
    },
  ],
  permissions: [
    'contentSettings',
    'storage',
  ]
})
