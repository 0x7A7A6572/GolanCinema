
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { configManager, ParserItem } from '../utils/config';
import { PlayerManager } from '../utils/player';
import { getVideoUrlFromMainWorld } from '../utils/bridge';
import SettingsModal from '../components/SettingsModal.vue';

const isOpen = ref(false);
const showSettings = ref(false);
const selectedParserUrl = ref('');

const playerManager = computed(() => new PlayerManager(configManager.state));

const sortedParsers = computed(() => {
  return configManager.state.parserList
    .filter(p => p.enabled)
    .map((p, index) => ({ ...p, originalIndex: index }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
});

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

async function handleParserClick(parser: ParserItem) {
  selectedParserUrl.value = parser.url;
  
  // Get video URL from Main World (because we might need window variables)
  const videoUrl = await getVideoUrlFromMainWorld();
  
  if (configManager.state.embedPlay) {
    playerManager.value.replacePlayer(parser.url, videoUrl);
  } else {
    playerManager.value.openNewWindow(parser.url + encodeURIComponent(videoUrl));
  }
}

onMounted(async () => {
  await configManager.init();
});

</script>

<template>
  <div id="TM_wrapper" v-if="configManager.state.enabled">
    <div id="TM_inner" :class="{ 'tm-open': isOpen }">
      <div id="TM_controls">
        <button id="TMbtn_toggle" @click="toggleOpen" :title="isOpen ? '收起备用接口' : '展开备用接口'">
          <i class="iconfont" style="font-size: 32px;">&#xe601;</i>
        </button>
      </div>
      
      <div id="TM_container">
        <ul id="TM_list">
          <li class="tm-manager-item">
            <div class="tm-brand">
              Golan Cinema
            </div>
            <a href="https://github.com/0x7A7A6572/GolanCinema" target="_blank" title="GitHub" class="tm-github-link">
              <svg height="16" width="16" viewBox="0 0 16 16" version="1.1" style="fill:currentColor;">
                  <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </a>
            <a href="javascript:void(0)" @click="showSettings = true" title="管理">
              <i class="iconfont">&#xe842;</i>
            </a>
          </li>
          
          <li v-if="sortedParsers.length === 0" style="grid-column: 1 / -1; padding:15px; color:#999; text-align:center;">
            暂无启用接口<br><small>请点击管理开启或添加</small>
          </li>
          
          <li v-for="p in sortedParsers" :key="p.originalIndex">
            <a 
              href="javascript:void(0)" 
              class="tm-parse-link" 
              :class="{ active: selectedParserUrl === p.url, 'pinned-top': p.pinned }"
              @click="handleParserClick(p)"
              :title="'使用 ' + p.name + ' 解析'"
            >
              <span >{{ p.name }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <SettingsModal :show="showSettings" @close="showSettings = false" />
</template>

<style scoped>
#TM_wrapper { 
  position: fixed; top: 120px; right: 0; z-index: 99998; 
  font-family: "Microsoft YaHei", sans-serif; pointer-events: none; 
}
#TM_inner { 
  display: flex; flex-direction: row; align-items: flex-start; 
  pointer-events: auto; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  transform: translateX(320px); 
}
#TM_inner.tm-open { transform: translateX(0); }
#TM_container { 
  width: 320px; max-height: 80vh; overflow-y: auto; overflow-x: hidden; 
  background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); 
  border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); 
  border-left: none; box-shadow: -5px 5px 15px rgba(0,0,0,0.3); 
  scrollbar-width: thin; scrollbar-color: rgba(0, 213, 221, 0.3) transparent; 
}

#TM_controls { display: flex; flex-direction: column; padding: 5px 0; background: transparent; }
#TMbtn_toggle { 
  color: #00d5d3; width: 50px; height: 50px; border: none; outline: none; 
  cursor: pointer; border-radius: 8px 0 0 8px; 
  background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); 
  border: 1px solid rgba(255,255,255,0.1); border-right: none; 
  display: flex; align-items: center; justify-content: center; 
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2); transition: background 0.3s; padding: 0; 
}
#TMbtn_toggle:hover { background: rgba(50, 50, 50, 0.95); }
.tm-open #TMbtn_toggle { background: #00d5d3; color: #000; }

#TM_list { 
  list-style: none; margin: 0; padding: 10px; padding-top: 0; 
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; 
}
#TM_list li a { 
  display: block; padding: 8px 5px; color: #e0e0e0; text-decoration: none; 
  font-size: 13px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; 
  transition: all 0.2s; white-space: nowrap; overflow: hidden; 
  text-overflow: ellipsis; text-align: center; background: rgba(255,255,255,0.05); 
}
#TM_list li a:hover { 
  background: rgba(255,255,255,0.15); color: #fff; border-color: #00d5d3; 
  transform: translateY(-1px); 
}
#TM_list li a.active { 
  background: rgba(0, 213, 221, 0.2); color: #00d5d3; border-color: #00d5d3; 
}

.tm-manager-item { 
  grid-column: 1 / -1; border-bottom: 1px solid rgba(255,255,255,0.1); 
  margin-bottom: 5px; position: sticky; top: -10px; z-index: 10; 
  background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px); 
  padding: 5px 0; display: flex; justify-content: flex-end; gap: 5px; padding-right: 5px; 
}
.tm-brand {
  display: flex; align-items: center; color: white; flex: 1; 
  font-size: 14px; font-weight: bold; font-family: auto; 
  background: linear-gradient(45deg, #00d5d3, transparent 32%); 
  padding-left: 10px; border-radius: 7px; border-bottom-left-radius: 0;
}
.tm-github-link {
  width: auto !important; padding: 0 12px !important; display: flex !important; 
  align-items: center; justify-content: center;
}
.tm-manager-item a { color: #aaa; font-size: 13px; text-align: center; border: none !important; background: transparent !important; }
.tm-manager-item a:hover { color: #fff; background: rgba(0, 213, 221, 0.1) !important; }
.tm-manager-item a .iconfont { font-size: 18px; }

.pinned-top { position: relative; }
.pinned-top::before {
  content: ""; position: absolute; left: 0; top: 0; width: 16px; height: 15px;
  background: linear-gradient(133deg, #00d2d0 50%, #00fffd00 50%);
}

@font-face {
  font-family: 'iconfont';
  src: url('https://at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.woff2?t=1772913483442') format('woff2'),
       url('https://at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.woff?t=1772913483442') format('woff'),
       url('https://at.alicdn.com/t/c/font_5134748_ltvrkvc21sp.ttf?t=1772913483442') format('truetype');
}
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
