// ==UserScript==
// @name        勾栏观影 - Golan Cinema
// @namespace    videoParser_Ultimate_Manager
// @version      1.1.0
// @description  【勾栏听曲，闲坐看戏】漫步瓦舍勾栏，笑看人间大戏。无需碎银几两，亦可入座观影。
// @author       zzerx
// @match        *://*.iqiyi.com/v_*
// @match        *://v.youku.com/*
// @match        *://*.le.com/*
// @match        *://v.qq.com/*
// @match        *://*.tudou.com/*
// @match        *://*.mgtv.com/*
// @match        *://film.sohu.com/*
// @match        *://*.acfun.cn/v/*
// @match        *://*.bilibili.com/*
// @match        *://vip.1905.com/play/*
// @match        *://vip.pptv.com/show/*
// @match        *://v.yinyuetai.com/video/*
// @match        *://v.yinyuetai.com/playlist/*
// @match        *://*.fun.tv/vplay/*
// @match        *://*.wasu.cn/Play/show/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @downloadURL https://raw.githubusercontent.com/0x7A7A6572/GolanCinema/main/golan-main.js
// @updateURL https://raw.githubusercontent.com/0x7A7A6572/GolanCinema/main/golan-main.js
// ==/UserScript==

(function() {
    'use strict';

    // ================= Environment Detection =================
    const IS_GM = typeof GM_getValue !== 'undefined';
    const WIN = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
    const STORAGE_KEY = 'VIP_PARSER_CUSTOM_DATA_V5';
    
    // Default Interface Library (Factory Reset Benchmark)
    const DEFAULT_PRESET = [
        {name: "爱豆解析", url: "https://jx.aidouer.net/?url="},
        {name: "纯净/B站", url: "https://im1907.top/?jx="},
        {name: "虾米解析", url: "https://jx.xmflv.com/?url="},
        {name: "Yangtu解析", url: "https://jx.yangtu.top/?url="},
        {name: "M3U8.TV", url: "https://jx.m3u8.tv/jiexi/?url="},
        {name: "全民解析", url: "https://jx.blbo.cc=>4433/?url="},
        {name: "七哥解析", url: "https://jx.nnxv.cn/tv.php?url="},
        {name: "冰豆解析", url: "https://api.qianqi.net/vip/?url="},
        {name: "CKPlayer", url: "https://www.ckplayer.vip/jiexi/?url="},
        {name: "playerjy", url: "https://jx.playerjy.com/?url="},
        {name: "ccyjjd", url: "https://ckmov.ccyjjd.com/ckmov/?url="},
        {name: "诺诺解析", url: "https://www.ckmov.com/?url="},
        {name: "MUTV", url: "https://jiexi.janan.net/jiexi/?url="},
        {name: "8090解析", url: "https://www.8090g.cn/?url="},
    ];

    // Default Site Selectors (For Embedded Playback)
    const DEFAULT_SELECTORS = [
        { host: 'iqiyi.com', selector: '#areaLeftContainer' },
        { host: 'v.qq.com', selector: '.container-player' },
        { host: 'le.com', selector: '.le_playbox' },
        { host: 'youku.com', selector: '.player-container' },
        { host: 'bilibili.com', selector: '#player_module,#bilibili-player' }
    ];

    // ================= Utilities =================
    const Logger = {
        debug: false,
        logCount: 1,
        log: (...args) => {
            if (!Logger.debug) return;
            console.log(`#${Logger.logCount++}-[VIP Parser]:`, ...args);
        },
        error: (...args) => console.error('[VIP Parser Error]:', ...args)
    };

    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    // ================= Core Logic: Storage Service =================
    class StorageService {
        constructor() {
            this.isGM = IS_GM;
        }

        async load() {
            if (this.isGM) {
                return new Promise((resolve) => {
                    const raw = GM_getValue(STORAGE_KEY);
                    let data = null;
                    if (raw) {
                        try {
                            data = JSON.parse(raw);
                        } catch (e) {
                            Logger.error('GM_getValue parse error', e);
                        }
                    }
                    resolve(data);
                });
            } else {
                return new Promise((resolve) => {
                    const handler = (event) => {
                        if (event.source !== window) return;
                        if (event.data.type === 'GOLAN_DATA_RESPONSE') {
                            window.removeEventListener('message', handler);
                            resolve(event.data.payload);
                        }
                    };
                    window.addEventListener('message', handler);
                    window.postMessage({ type: 'GOLAN_LOAD_REQUEST' }, '*');
                    
                    // Fallback timeout in case bridge is missing
                    setTimeout(() => {
                        window.removeEventListener('message', handler);
                        resolve(null);
                    }, 1000);
                });
            }
        }

        save(data) {
            if (this.isGM) {
                try {
                    GM_setValue(STORAGE_KEY, JSON.stringify(data));
                } catch (e) {
                    Logger.error('GM_setValue error:', e);
                }
            } else {
                window.postMessage({ 
                    type: 'GOLAN_SAVE_REQUEST', 
                    payload: data 
                }, '*');
            }
        }

        reset() {
            if (this.isGM) {
                GM_deleteValue(STORAGE_KEY);
                location.reload();
            } else {
                window.postMessage({ type: 'GOLAN_RESET_REQUEST' }, '*');
                location.reload(); 
            }
        }
    }

    // ================= Core Logic: Data Management =================
    class ConfigManager {
        constructor() {
            this.storage = new StorageService();
            // Initial default config
            this.config = {
                parserList: DEFAULT_PRESET.map(p => ({ ...p, enabled: true })),
                embedPlay: true,
                siteSelectors: JSON.parse(JSON.stringify(DEFAULT_SELECTORS))
            };
        }

        async init() {
            try {
                const data = await this.storage.load();
                if (data) {
                    this.mergeConfig(data);
                } else {
                    // Fallback: Try to migrate from localStorage (Legacy)
                    try {
                        const localRaw = localStorage.getItem(STORAGE_KEY);
                        if (localRaw) {
                            console.log('[VIP Parser] Migrating data from localStorage...');
                            this.mergeConfig(localRaw);
                            this.saveData(); 
                        }
                    } catch(e) {
                        console.warn('[VIP Parser] localStorage migration failed:', e);
                    }
                }
            } catch (e) {
                Logger.error('Init config error:', e);
            }
        }

        // loadData method removed, using StorageService instead

        mergeConfig(raw) {
             if (!raw) return;
             
             let data;
             try {
                 if (typeof raw === 'string') {
                     data = JSON.parse(raw);
                 } else {
                     data = raw;
                 }
             } catch (e) {
                 Logger.error('Parse config error:', e);
                 return;
             }

            // Backward compatibility
            let loadedList = [];
            if (data.list && Array.isArray(data.list)) {
                loadedList = data.list;
            } else if (data.parserList && Array.isArray(data.parserList)) {
                loadedList = data.parserList;
            }

            if (loadedList.length > 0) {
                this.config.parserList = loadedList.filter(p => p !== null && p !== undefined);
            }
            
            if (typeof data.embedPlay === 'boolean') this.config.embedPlay = data.embedPlay;
            if (data.siteSelectors && Array.isArray(data.siteSelectors)) this.config.siteSelectors = data.siteSelectors;
        }

        saveData() {
            const dataToSave = {
                parserList: this.config.parserList,
                embedPlay: this.config.embedPlay,
                siteSelectors: this.config.siteSelectors,
                version: 2
            };
            this.storage.save(dataToSave);
        }

        resetData() {
            if(confirm('确定要重置所有配置吗？\n这将删除你添加的所有自定义接口和设置，并恢复默认状态。')) {
                this.storage.reset();
            }
        }
    }

    // ================= Core Logic: Site Adapters =================
    class BaseAdapter {
        match(url) { return false; }
        
        preload() {
            // Default no-op
        }

        getVideoUrl() {
            return window.location.href;
        }
    }

    class IqiyiAdapter extends BaseAdapter {
        match(url) {
            return url.indexOf('iqiyi.com') > 0;
        }

        preload() {
            try {
                // Accessing window.Q directly since we are in MAIN world now
                // Use WIN for safe access in both environments
                if(WIN.Q && WIN.Q.PageInfo && WIN.Q.PageInfo.playPageInfo && WIN.Q.PageInfo.playPageInfo.albumId !== undefined ){
                    const s = document.createElement("script");
                    const el = document.getElementsByTagName("script")[0];
                    s.async = false;
                    s.src = document.location.protocol + "//cache.video.qiyi.com/jp/avlist/"+ WIN.Q.PageInfo.playPageInfo.albumId +"/1/50/";
                    if(el && el.parentNode) el.parentNode.insertBefore(s, el);
                }
            } catch(e) { Logger.log('IQIYI Preload Error', e); }
        }

        getVideoUrl() {
            let currentUrl = window.location.href;
            try {
                const ele = document.querySelectorAll('li[class="item selected"] > span').length ? 
                            document.querySelectorAll('li[class="item selected"] > span')[1] : 
                            document.querySelectorAll('li[class="item no selected"] > span')[1];
                
                if(ele !== undefined ){
                    const pd = ele.parentNode.getAttribute('data-pd');
                    // Accessing window.tvInfoJs directly
                    if(pd > 0 && WIN.tvInfoJs && WIN.tvInfoJs.data && WIN.tvInfoJs.data.vlist){
                        const vinfo = WIN.tvInfoJs.data.vlist[pd-1];
                        if(vinfo && vinfo.vurl && vinfo.vurl.length > 0) currentUrl = vinfo.vurl;
                    }
                }
            } catch(e) { Logger.log('IQIYI Parse Error', e); }
            return currentUrl;
        }
    }

    class SiteAdapterFactory {
        static getAdapter(url) {
            const adapters = [new IqiyiAdapter()];
            for (const adapter of adapters) {
                if (adapter.match(url)) return adapter;
            }
            return new BaseAdapter();
        }
    }


    // ================= Core Logic: Player Management =================
    class PlayerManager {
        constructor(configManager) {
            this.configManager = configManager;
        }

        replacePlayer(parserUrl, videoUrl) {
            const fullUrl = parserUrl + encodeURIComponent(videoUrl);
            const host = window.location.hostname;
            const selectorObj = this.configManager.config.siteSelectors.find(s => host.includes(s.host));
            
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
                // 确保 iframe 至少有 600px 高度
                iframe.style.minHeight = '600px';
                iframe.style.border = 'none';
                iframe.style.background = 'black';
                iframe.style.zIndex = '9999';
                iframe.style.position = 'absolute';
                iframe.style.border = '2px solid #00d5d3';
                iframe.style.borderRadius = '10px';
                iframe.style.boxShadow = '2px 2px 5px #00d5d3';

                iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
                iframe.setAttribute('allowfullscreen', 'true');
                
                playerNode.innerHTML = '';
                playerNode.appendChild(iframe);
            } else {
                if(confirm('未找到视频播放窗口元素，将使用新窗口打开。')){
                    this.openNewWindow(fullUrl);
                }
            }
        }

        openNewWindow(url) {
            window.open(url, "_blank");
        }
    }

    // ================= UI Management =================
    class UIManager {
        constructor(configManager, playerManager, adapter) {
            this.configManager = configManager;
            this.playerManager = playerManager;
            this.adapter = adapter;
            this.selectedParserUrl = '';
            this.currentTab = 'parsers';
            this.tmInner = null;
            this.tmBtnToggle = null;
        }

        init() {
            this.injectStyles();
            this.buildUI();
            this.bindEvents();
            this.renderList();
        }

        injectStyles() {
            addStyle(`
                @font-face {
                  font-family: 'iconfont';  /* Project id 5134748 */
                  src: url('//at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.woff2?t=1772913483442') format('woff2'),
                       url('//at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.woff?t=1772913483442') format('woff'),
                       url('//at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.ttf?t=1772913483442') format('truetype');
                }
                .iconfont {
                  font-family: "iconfont" !important;
                  font-size: 16px;
                  font-style: normal;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                }
                #TM_wrapper { position: fixed; top: 120px; right: 0; z-index: 99998; font-family: "Microsoft YaHei", sans-serif; pointer-events: none; }
                #TM_inner { display: flex; flex-direction: row; align-items: flex-start; pointer-events: auto; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(320px); }
                #TM_inner.tm-open { transform: translateX(0); }
                #TM_container { width: 320px; max-height: 80vh; overflow-y: auto; overflow-x: hidden; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-left: none; box-shadow: -5px 5px 15px rgba(0,0,0,0.3); scrollbar-width: thin; scrollbar-color: rgba(0, 213, 221, 0.3) transparent; }
                #TM_container::-webkit-scrollbar { width: 4px; }
                #TM_container::-webkit-scrollbar-track { background: transparent; }
                #TM_container::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; }
                #TM_container:hover::-webkit-scrollbar-thumb { background-color: rgba(0, 213, 221, 0.6); }
                #TM_controls { display: flex; flex-direction: column; padding: 5px 0; background: transparent; }
                #TMbtn_toggle { color: #00d5d3; width: 50px; height: 50px; border: none; outline: none; cursor: pointer; border-radius: 8px 0 0 8px; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-right: none; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 8px rgba(0,0,0,0.2); transition: background 0.3s; padding: 0; }
                #TMbtn_toggle:hover { background: rgba(50, 50, 50, 0.95); }
                .tm-open #TMbtn_toggle { background: #00d5d3; color: #000; }
                #TM_list { list-style: none; margin: 0; padding: 10px; padding-top: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                #TM_list li a { display: block; padding: 8px 5px; color: #e0e0e0; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; background: rgba(255,255,255,0.05); }
                #TM_list li a:hover { background: rgba(255,255,255,0.15); color: #fff; border-color: #00d5d3; transform: translateY(-1px); }
                #TM_list li a.active { background: rgba(0, 213, 221, 0.2); color: #00d5d3; border-color: #00d5d3; }
                #TM_list li.tm-manager-item { grid-column: 1 / -1; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px; position: sticky; top: -10px; z-index: 10; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); padding: 5px 0; }
                #TM_list li.tm-manager-item a { color: #aaa; font-size: 13px; text-align: center; border: none; background: transparent; }
                #TM_list li.tm-manager-item a:hover { color: #fff; background: rgba(0, 213, 221, 0.1); }
                #TM_list li.tm-manager-item a .iconfont { font-size: 18px; }

                .tm-parse-link { position: relative; }
                .pinned-top::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 16px;
                    height: 15px;
                    background: linear-gradient(133deg, #00d2d0 50%, #00fffd00 50%);
                } 
                .tm-manage-row.pinned-top {
                  background: rgba(0, 213, 221, 0.05);
                }

                /* Modal Styles */
                #TM_modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100000; justify-content: center; align-items: center; }
                .tm-modal-panel { background: #2b2b2b; width: 500px; max-width: 95%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; animation: tmFadeIn 0.3s ease; }
                #TM_modal_content { display: contents; }
                @keyframes tmFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .tm-modal-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #333; flex-shrink: 0; }
                .tm-modal-header h3 { margin: 0; color: #fff; font-size: 18px; font-weight: normal; }
                .tm-modal-close { background: none; border: none; color: #aaa; font-size: 24px; cursor: pointer; line-height: 1; padding: 0; }
                .tm-modal-close:hover { color: #fff; }
                
                .tm-add-section { padding: 15px 20px; background: #383838; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; flex-shrink: 0; }
                .tm-input { flex: 1; min-width: 120px; padding: 8px 12px; background: #222 !important; border: 1px solid #444 !important; color: #eee !important; border-radius: 6px !important; font-size: 13px !important; outline: none !important; height: auto !important; line-height: normal !important; box-shadow: none !important; margin: 0 !important; }
                .tm-input:focus { border-color: #00d5d3 !important; }
                .tm-btn-add { padding: 8px 16px; background: #444; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; }
                .tm-btn-add:hover { background: #818181ff; color: #000; }

                .tm-modal-body { padding: 0; overflow-y: auto; flex: 1; min-height: 0; scrollbar-width: thin; scrollbar-color: rgba(0, 213, 221, 0.3) transparent; }
                .tm-modal-body::-webkit-scrollbar { width: 6px; }
                .tm-modal-body::-webkit-scrollbar-track { background: transparent; }
                .tm-modal-body::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; }
                .tm-modal-body:hover::-webkit-scrollbar-thumb { background-color: rgba(0, 213, 221, 0.6); }
                #tm-manage-list { display: flex; flex-direction: column; }
                
                .tm-manage-row { position: relative; display: flex; align-items: center; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
                .tm-manage-row:hover { background: rgba(255,255,255,0.03); }
                .tm-manage-row.disabled { opacity: 0.5; }
                .tm-manage-row.disabled .tm-name { text-decoration: line-through; color: #777; }
                
                .tm-switch-label { position: relative; display: inline-block; width: 34px; height: 20px; margin-left: 15px; flex-shrink: 0; }
                .tm-switch-label input { opacity: 0; width: 0; height: 0; margin-right: 5px; }
                .tm-switch-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .4s; border-radius: 20px; }
                .tm-switch-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .tm-switch-slider { background-color: #00d5d38c; }
                input:checked + .tm-switch-slider:before { transform: translateX(14px); }

                .tm-info { flex: 1; overflow: hidden; }
                .tm-name { color: #eee; font-size: 14px; font-weight: bold; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .tm-url { color: #888; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; }
                
                .tm-btn-delete { display: flex;padding: 5px; border-radius: 4px; border: none; color: white; font-size: 34px; cursor: pointer; margin-left: 10px; transition: 0.2s; }
                .tm-btn-delete:hover { opacity: 1; transform: scale(1.2); }
                .tm-btn-pin { display: flex; align-items: center; justify-content: center; background: none; border: none; color: white; font-size: 22px; cursor: pointer; padding: 5px; margin-left: 5px; opacity: 0.6; transition: 0.2s; }
                .tm-btn-pin:hover { opacity: 1; transform: scale(1.2); }

                .tm-modal-footer { padding: 15px 20px; border-top: 1px solid rgba(255,255,255,0.1); background: #333; display: flex; justify-content: space-between; flex-shrink: 0; }
                .tm-btn-danger { background: rgba(255, 68, 68, 0.2); color: #ff6666; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: 0.2s; }
                .tm-btn-danger:hover { background: rgba(255, 68, 68, 0.4); color: #fff; }
                .tm-btn-primary { background: linear-gradient(135deg, #00d5d3 0%, #00ff5c 100%); color: #333; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; transition: 0.2s; }
                .tm-btn-primary:hover { box-shadow: 0 0 10px rgba(0, 213, 221, 0.4); transform: translateY(-1px); }

                .tm-tabs { display: flex; background: #333; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .tm-tab { flex: 1; padding: 12px; text-align: center; color: #aaa; cursor: pointer; transition: 0.2s; font-size: 14px; }
                .tm-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .tm-tab.active { color: #00d5d3; border-bottom: 2px solid #00d5d3; background: rgba(0, 213, 221,0.05); }
                .tm-setting-group { padding: 15px 20px; }
                .tm-setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .tm-setting-label { color: #eee; font-size: 14px; }
                .tm-setting-desc { color: #888; font-size: 12px; line-height: 1.4; }
                .tm-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
                .tm-tag-current { display: inline-block; background: #00d5d3; color: #000; padding: 1px 4px; border-radius: 3px; font-size: 10px; margin-left: 5px; vertical-align: middle; font-weight: normal; }
                .tm-current-site { background: rgba(0, 213, 221, 0.05); border-left: 2px solid #00d5d3; }
            `);
        }

        buildUI() {
            const htmlStructure = `
                <div id="TM_wrapper">
                    <div id="TM_inner">
                        <div id="TM_controls">
                            <button id="TMbtn_toggle" title="展开/收起备用接口">
                                <i class="iconfont" style="font-size: 32px;">&#xe601;</i>
                            </button>
                        </div>
                        <div id="TM_container">
                            <ul id="TM_list"></ul>
                        </div>
                    </div>
                </div>

                <div id="TM_modal">
                    <div class="tm-modal-panel">
                        <div id="TM_modal_content"></div>
                    </div>
                </div>
            `;

            const div = document.createElement("div");
            div.innerHTML = htmlStructure;
            document.body.appendChild(div);

            this.tmInner = document.getElementById("TM_inner");
            this.tmBtnToggle = document.getElementById("TMbtn_toggle");
        }

        bindEvents() {
            this.tmBtnToggle.addEventListener("click", () => {
                const isOpen = this.tmInner.classList.contains("tm-open");
                if (isOpen) {
                    this.tmInner.classList.remove("tm-open");
                    this.tmBtnToggle.title = "展开备用接口";
                } else {
                    this.tmInner.classList.add("tm-open");
                    this.tmBtnToggle.title = "收起备用接口";
                }
            });
        }

        renderList() {
            const listEl = document.getElementById('TM_list');
            if(!listEl) return;
            
            let html = `<li class="tm-manager-item" style="display:flex; justify-content:flex-end; gap:5px; padding-right:5px;">
            <view style="
                display: flex;
                align-items: center;
                color: white;
                flex: 1;
                font-size: larger;
                font-weight: bold;
                font-family: auto;
                background: linear-gradient(45deg, #00d5d3, transparent 32%);
                padding-left: 10px;
                border-radius: 7px;
                border-bottom-left-radius: 0;
            ">Golan Cinema
            </view>
            <a href="https://github.com/0x7A7A6572/GolanCinema" target="_blank" title="GitHub" style="width:auto; padding:0 12px; display:flex; align-items:center; justify-content:center;">
                    <svg height="16" width="16" viewBox="0 0 16 16" version="1.1" style="fill:currentColor;">
                        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                </a>
                <a href="javascript:void(0)" id="TM_btn_manage"><i class="iconfont">&#xe842;</i></a>
            </li>`;
            
            const enabled = this.configManager.config.parserList.filter(p => p.enabled).sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return 0;
            });
            
            if (enabled.length === 0) {
                html += '<li style="grid-column: 1 / -1; padding:15px; color:#999; text-align:center;">暂无启用接口<br><small>请点击管理开启或添加</small></li>';
            } else {
                enabled.forEach((p) => {
                    const isSelected = this.selectedParserUrl === p.url;
                    const pinnedStyle = p.pinned ? ' pinned-top' : '';
                    const className = isSelected ? 'tm-parse-link active' : 'tm-parse-link';
                    html += `<li><a href="javascript:void(0)" class="${className}" data-url="${p.url}" title="使用 ${p.name} 解析"><span class="${pinnedStyle}">${p.name}</span></a></li>`;
                });
            }
            
            listEl.innerHTML = html;
            
            document.getElementById('TM_btn_manage').addEventListener('click', () => this.openManagerModal());
            
            document.querySelectorAll('.tm-parse-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = e.currentTarget.getAttribute('data-url');
                    
                    this.selectedParserUrl = url;
                    this.renderList();
                    
                    const videoUrl = this.adapter.getVideoUrl();
                    if(this.configManager.config.embedPlay) {
                        this.playerManager.replacePlayer(url, videoUrl);
                    } else {
                        this.playerManager.openNewWindow(url + encodeURIComponent(videoUrl));
                    }
                });
            });
        }

        renderModalContent() {
            const content = document.getElementById('TM_modal_content');
            if(!content) return;
            
            let html = `
                <div class="tm-modal-header">
                    <h3>通道接口管理</h3>
                    <div style="display:flex; gap:15px; align-items:center;">
                        <button id="TM_modal_close" class="tm-modal-close">&times;</button>
                    </div>
                </div>
                <div class="tm-tabs">
                    <div class="tm-tab ${this.currentTab === 'parsers' ? 'active' : ''}" data-tab="parsers">接口列表 (${this.configManager.config.parserList.length})</div>
                    <div class="tm-tab ${this.currentTab === 'settings' ? 'active' : ''}" data-tab="settings">高级设置</div>
                </div>
                <div class="tm-modal-body">
            `;
            
            if (this.currentTab === 'parsers') {
                html += `
                <div class="tm-add-section">
                    <input type="text" id="new-name" placeholder="接口名称" class="tm-input">
                    <input type="text" id="new-url" placeholder="接口URL" class="tm-input">
                    <button id="tm-btn-add" class="tm-btn-add">+ 添加</button>
                </div>
                <div id="tm-manage-list">`;
                
                const sortedList = this.configManager.config.parserList.map((p, index) => ({...p, originalIndex: index}))
                    .sort((a, b) => {
                        if (a.pinned && !b.pinned) return -1;
                        if (!a.pinned && b.pinned) return 1;
                        return 0;
                    });

                sortedList.forEach((p) => {
                    const index = p.originalIndex;
                    const pinnedStyle = p.pinned ? ' pinned-top' : '';
                    html += `
                        <div class="tm-manage-row ${p.enabled ? '' : 'disabled'} ${pinnedStyle}">
                            <div class="tm-info">
                                <div class="tm-name">${p.name}</div>
                                <div class="tm-url">${p.url}</div>
                            </div>
                            <button class="tm-btn-pin tm-action-pin" data-index="${index}" title="${p.pinned ? '取消置顶' : '置顶'}"><i class="iconfont">&#xe863;</i></button>
                            <button class="tm-btn-delete tm-action-delete-parser" data-index="${index}" title="删除"><i class="iconfont">&#xe83a;</i></button>
                            <label class="tm-switch-label">
                                <input type="checkbox" ${p.enabled ? 'checked' : ''} class="tm-action-toggle" data-index="${index}">
                                <span class="tm-switch-slider"></span>
                            </label>
                        </div>
                    `;
                });
                html += `</div>`;
            } else {
                html += `
                    <div class="tm-setting-group">
                        <div class="tm-setting-row">
                            <span class="tm-setting-label">开启页内嵌入播放</span>
                            <label class="tm-switch-label">
                                <input type="checkbox" ${this.configManager.config.embedPlay ? 'checked' : ''} id="tm-switch-embed">
                                <span class="tm-switch-slider"></span>
                            </label>
                        </div>
                        <div class="tm-setting-desc">开启后，点击解析将尝试直接替换当前网页的播放器，而不是打开新窗口。</div>
                    </div>

                    <div class="tm-divider"></div>
                    <h4 style="color:#eee; margin:10px 20px;"><i class="iconfont" style="margin-right:5px;">&#xe824;</i> 站点视频窗口元素匹配规则</h4>
                    
                    <div class="tm-add-section">
                        <input type="text" id="new-host" placeholder="域名关键词 (如 iqiyi.com)" class="tm-input" value="${window.location.hostname}">
                        <input type="text" id="new-selector" placeholder="播放器元素选择器 (如 #flashbox)" class="tm-input">
                        <button id="tm-btn-add-selector" class="tm-btn-add">+ 添加/更新</button>
                    </div>
                    
                    <div id="tm-selector-list">
                `;
                
                const currentHost = window.location.hostname;
                this.configManager.config.siteSelectors.forEach((s, index) => {
                    const isCurrent = currentHost.includes(s.host);
                    html += `
                        <div class="tm-manage-row ${isCurrent ? 'tm-current-site' : ''}">
                            <div class="tm-info">
                                <div class="tm-name">
                                    ${s.host}
                                    ${isCurrent ? '<span class="tm-tag-current">当前</span>' : ''}
                                </div>
                                <div class="tm-url">${s.selector}</div>
                            </div>
                            <button class="tm-btn-pin tm-action-edit-selector" data-index="${index}" title="编辑"><i class="iconfont">&#xe84f;</i></button>
                            <button class="tm-btn-delete tm-action-delete-selector" data-index="${index}" title="删除"><i class="iconfont">&#xe83a;</i></button>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            html += `
                </div>
                <div class="tm-modal-footer">
                    <button id="tm-btn-reset" class="tm-btn-danger">重置所有</button>
                    <button id="TM_btn_save" class="tm-btn-primary">保存并关闭</button>
                </div>
            `;
            
            content.innerHTML = html;
            
            // --- Event Bindings for Modal ---
            document.getElementById('TM_modal_close').onclick = () => document.getElementById('TM_modal').style.display = 'none';
            document.getElementById('TM_btn_save').onclick = () => { 
                this.configManager.saveData(); 
                document.getElementById('TM_modal').style.display = 'none'; 
                this.renderList(); 
            };
            document.getElementById('tm-btn-reset').onclick = () => this.configManager.resetData();
            
            document.querySelectorAll('.tm-tab').forEach(t => {
                t.onclick = () => {
                    this.currentTab = t.getAttribute('data-tab');
                    this.renderModalContent();
                };
            });

            if (this.currentTab === 'parsers') {
                document.getElementById('tm-btn-add').onclick = () => this.addParser();
                
                document.querySelectorAll('.tm-action-toggle').forEach(el => {
                    el.onchange = (e) => this.toggleParser(parseInt(el.getAttribute('data-index')));
                });
                document.querySelectorAll('.tm-action-delete-parser').forEach(el => {
                    el.onclick = (e) => this.deleteParser(parseInt(el.getAttribute('data-index')));
                });
                document.querySelectorAll('.tm-action-pin').forEach(el => {
                    el.onclick = (e) => this.togglePin(parseInt(el.getAttribute('data-index')));
                });
            } else {
                document.getElementById('tm-switch-embed').onchange = (e) => {
                    this.configManager.config.embedPlay = e.target.checked;
                    this.configManager.saveData();
                };
                document.getElementById('tm-btn-add-selector').onclick = () => this.addSelector();
                
                document.querySelectorAll('.tm-action-edit-selector').forEach(el => {
                    el.onclick = (e) => {
                        const index = parseInt(el.getAttribute('data-index'));
                        const item = this.configManager.config.siteSelectors[index];
                        document.getElementById('new-host').value = item.host;
                        document.getElementById('new-selector').value = item.selector;
                    };
                });
                document.querySelectorAll('.tm-action-delete-selector').forEach(el => {
                    el.onclick = (e) => this.deleteSelector(parseInt(el.getAttribute('data-index')));
                });
            }
        }

        openManagerModal() {
            const modal = document.getElementById('TM_modal');
            if(!modal) return;
            modal.style.display = 'flex';
            this.renderModalContent();
            modal.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
        }

        // --- Action Handlers ---
        toggleParser(index) {
            this.configManager.config.parserList[index].enabled = !this.configManager.config.parserList[index].enabled;
            this.configManager.saveData();
            this.renderModalContent();
        }

        togglePin(index) {
            this.configManager.config.parserList[index].pinned = !this.configManager.config.parserList[index].pinned;
            this.configManager.saveData();
            this.renderModalContent();
        }

        deleteParser(index) {
            if(confirm(`确定要删除接口 "${this.configManager.config.parserList[index].name}" 吗？`)) {
                this.configManager.config.parserList.splice(index, 1);
                this.configManager.saveData();
                this.renderModalContent();
            }
        }
        
        deleteSelector(index) {
            if(confirm(`确定删除 "${this.configManager.config.siteSelectors[index].host}" 的规则?`)) {
                this.configManager.config.siteSelectors.splice(index, 1);
                this.configManager.saveData();
                this.renderModalContent();
            }
        }

        addParser() {
            const nameIn = document.getElementById('new-name');
            const urlIn = document.getElementById('new-url');
            const name = nameIn.value.trim();
            let url = urlIn.value.trim();

            if (!name || !url) {
                alert('请填写名称和URL');
                return;
            }
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                alert('URL 必须以 http:// 或 https:// 开头');
                return;
            }
            if (!url.includes('?url=') && !url.includes('&url=')) {
                if(url.endsWith('?') || url.endsWith('&')) url += 'url=';
                else url += '?url=';
            }

            this.configManager.config.parserList.push({ name, url, enabled: true });
            this.configManager.saveData();
            this.renderModalContent();
        }
        
        addSelector() {
            const host = document.getElementById('new-host').value.trim();
            const selector = document.getElementById('new-selector').value.trim();
            if(!host || !selector) return alert('请填写完整');
            
            // Check for duplicates
            const existingIndex = this.configManager.config.siteSelectors.findIndex(s => s.host === host);
            
            if (existingIndex !== -1) {
                if(confirm(`域名 "${host}" 的规则已存在，要覆盖吗？`)) {
                    this.configManager.config.siteSelectors[existingIndex].selector = selector;
                } else {
                    return;
                }
            } else {
                this.configManager.config.siteSelectors.push({host, selector});
            }
            
            this.configManager.saveData();
            this.renderModalContent();
        }
    }

    // ================= Main Execution =================
    
    async function main() {
        // Initialize components
        const configManager = new ConfigManager();
        await configManager.init();
        
        const adapter = SiteAdapterFactory.getAdapter(window.location.href);
        const playerManager = new PlayerManager(configManager);
        const uiManager = new UIManager(configManager, playerManager, adapter);

        // Preload site-specific data (e.g., iQiyi album info)
        adapter.preload();

        // Initialize UI
        uiManager.init();
    }
    
    main().catch(e => console.error(e));

})();
