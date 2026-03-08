<script setup lang="ts">
import { ref, computed } from 'vue';
import { configManager } from '../utils/config';

const props = defineProps<{
  show: boolean;
  currentHost?: string;
  isFullPage?: boolean;
}>();

const emit = defineEmits(['close']);

const hostname = computed(() => props.currentHost || window.location.hostname);

const currentTab = ref<'parsers' | 'settings'>('parsers');

// Parsers Tab
const newParserName = ref('');
const newParserUrl = ref('');

const sortedParsers = computed(() => {
  return [...configManager.state.parserList].map((p, index) => ({ ...p, originalIndex: index })).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
});

function addParser() {
  if (!newParserName.value || !newParserUrl.value) {
    alert('Please enter name and URL');
    return;
  }
  let url = newParserUrl.value.trim();
  if (!url.startsWith('http')) {
    alert('URL must start with http/https');
    return;
  }
  if (!url.includes('?url=') && !url.includes('&url=')) {
    url += (url.includes('?') ? '&' : '?') + 'url=';
  }

  configManager.state.parserList.push({
    name: newParserName.value,
    url,
    enabled: true,
  });
  configManager.save();
  newParserName.value = '';
  newParserUrl.value = '';
}

function toggleParser(index: number) {
  const item = configManager.state.parserList[index];
  if (item) {
    item.enabled = !item.enabled;
    configManager.save();
  }
}

function togglePin(index: number) {
  const item = configManager.state.parserList[index];
  if (item) {
    item.pinned = !item.pinned;
    configManager.save();
  }
}

function deleteParser(index: number) {
  if (confirm('Delete this parser?')) {
    configManager.state.parserList.splice(index, 1);
    configManager.save();
  }
}

// Settings Tab
const newHost = ref(props.currentHost || window.location.hostname);
const newSelector = ref('');

function addSelector() {
  if (!newHost.value || !newSelector.value) {
    alert('Please enter host and selector');
    return;
  }
  const existing = configManager.state.siteSelectors.find(s => s.host === newHost.value);
  if (existing) {
    if (confirm('Overwrite existing rule?')) {
      existing.selector = newSelector.value;
    } else {
      return;
    }
  } else {
    configManager.state.siteSelectors.push({
      host: newHost.value,
      selector: newSelector.value
    });
  }
  configManager.save();
}

function deleteSelector(index: number) {
  if (confirm('Delete this rule?')) {
    configManager.state.siteSelectors.splice(index, 1);
    configManager.save();
  }
}

function resetAll() {
  if (confirm('Reset all settings to default?')) {
    configManager.reset();
  }
}

function saveAndClose() {
  configManager.save();
  emit('close');
}

</script>

<template>
  <div v-if="show" class="tm-modal" :class="{ 'full-page': isFullPage }">
    <div class="tm-modal-panel">
      <div class="tm-modal-header">
        <h3>通道接口管理</h3>
        <div v-if="isFullPage" class="tm-modal-header-btn">
          <button @click="resetAll" class="tm-btn-danger">重置所有</button>
          <button v-if="!isFullPage" @click="saveAndClose" class="tm-btn-primary">保存并关闭</button>
          <button v-else @click="configManager.save()" class="tm-btn-primary">保存</button>
        </div>
        <button v-else class="tm-modal-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="full-page-content">


        <div class="tm-tabs">
          <div class="tm-tab" :class="{ active: currentTab === 'parsers' }" @click="currentTab = 'parsers'">
            接口列表 ({{ configManager.state.parserList.length }})
          </div>
          <div class="tm-tab" :class="{ active: currentTab === 'settings' }" @click="currentTab = 'settings'">
            高级设置
          </div>
        </div>

        <div class="tm-modal-body">
          <!-- Parsers Tab -->
          <div v-if="currentTab === 'parsers'">
            <div class="tm-add-section">
              <input v-model="newParserName" type="text" placeholder="接口名称" class="tm-input">
              <input v-model="newParserUrl" type="text" placeholder="接口URL" class="tm-input">
              <button @click="addParser" class="tm-btn-add">+ 添加</button>
            </div>

            <div class="tm-manage-list">
              <div v-for="p in sortedParsers" :key="p.originalIndex" class="tm-manage-row"
                :class="{ disabled: !p.enabled, 'pinned-top': p.pinned }">
                <div class="tm-info">
                  <div class="tm-name">{{ p.name }}</div>
                  <div class="tm-url">{{ p.url }}</div>
                </div>

                <button class="tm-btn-pin" @click="togglePin(p.originalIndex)" :title="p.pinned ? '取消置顶' : '置顶'">
                  <i class="iconfont">&#xe863;</i>
                </button>
                <button class="tm-btn-delete" @click="deleteParser(p.originalIndex)" title="删除">
                  <i class="iconfont">&#xe83a;</i>
                </button>

                <label class="tm-switch-label">
                  <input type="checkbox" :checked="p.enabled" @change="toggleParser(p.originalIndex)">
                  <span class="tm-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-else>
            <div class="tm-setting-group">
              <div class="tm-setting-row">
                <span class="tm-setting-label">开启页内嵌入播放</span>
                <label class="tm-switch-label">
                  <input type="checkbox" v-model="configManager.state.embedPlay" @change="configManager.save()">
                  <span class="tm-switch-slider"></span>
                </label>
              </div>
              <div class="tm-setting-desc">开启后，点击解析将尝试直接替换当前网页的播放器，而不是打开新窗口。</div>
            </div>

            <div class="tm-divider"></div>
            <h4 style="color:#eee; margin:10px 20px;">站点视频窗口元素匹配规则</h4>

            <div class="tm-add-section">
              <input v-model="newHost" type="text" placeholder="域名关键词" class="tm-input">
              <input v-model="newSelector" type="text" placeholder="选择器" class="tm-input">
              <button @click="addSelector" class="tm-btn-add">+ 添加/更新</button>
            </div>

            <div class="tm-manage-list">
              <div v-for="(s, index) in configManager.state.siteSelectors" :key="index" class="tm-manage-row"
                :class="{ 'tm-current-site': hostname && hostname.includes(s.host) }">
                <div class="tm-info">
                  <div class="tm-name">
                    {{ s.host }}
                    <span v-if="hostname && hostname.includes(s.host)" class="tm-tag-current">当前</span>
                  </div>
                  <div class="tm-url">{{ s.selector }}</div>
                </div>
                <button class="tm-btn-delete" @click="deleteSelector(index)">
                  <i class="iconfont">&#xe83a;</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="tm-modal-footer">
        <button @click="resetAll" class="tm-btn-danger">重置所有</button>
        <button v-if="!isFullPage" @click="saveAndClose" class="tm-btn-primary">保存并关闭</button>
        <button v-else @click="configManager.save()" class="tm-btn-primary">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles to isolate component */
/* Reuse styles from golan-main.js but scoped */

.tm-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100000;
  justify-content: center;
  align-items: center;
}

/* Full Page Mode Overrides */
.tm-modal.full-page {
  height: 100vh;
  /* position: static;
  background: transparent;
  width: 100%;
  height: auto;
  backdrop-filter: none;
  padding: 0; */
}

.tm-modal.full-page .tm-modal-header {
  background: none;
}

.tm-modal.full-page .tm-modal-body {
  width: 600px;
  /* height: 100%; */
  margin: auto;

  overflow-y: scroll;
  height: 100vh;
}

.tm-modal.full-page .tm-modal-header-btn {
  display: flex;
  gap: 10px;
}

.tm-modal.full-page .full-page-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  max-width: 900px;
  margin: 0 auto;
}

.tm-modal.full-page .tm-manage-list {
  max-height: none;
}

.tm-modal.full-page .tm-tabs {
  width: 200px;
  display: flex;
  flex-direction: column;
  background: transparent;
  text-align: right;

  margin-right: 20px;
  border-right: 1px solid #00d5d3;
  border-bottom: none;
  background: transparent;

  overflow-y: scroll;
  height: 100vh;
  scrollbar-width: none;
  scrollbar-color: rgba(0, 213, 221, 0.3) transparent;
}

.tm-modal.full-page .tm-tabs .tm-tab {
  border: none !important;
  flex-grow: 0;
  text-align: left;
}

.tm-modal.full-page .tm-modal-footer {
  display: none;
}

.tm-modal-panel {
  background: #2b2b2b;
  width: 500px;
  max-width: 95%;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tm-modal.full-page .tm-modal-panel {
  width: 100%;
  max-width: 100%;
  max-height: none;
  height: 100%;
  min-height: 500px;
  border: none;
  box-shadow: none;
  background: transparent;
}

.tm-modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #333;
  flex-shrink: 0;
}

.tm-modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: normal;
}

.tm-modal-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.tm-modal-close:hover {
  color: #fff;
}

.tm-tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tm-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  color: #aaa;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}

.tm-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.tm-tab.active {
  color: #00d5d3;
  border-bottom: 2px solid #00d5d3;
  background: rgba(0, 213, 221, 0.05);
}

.tm-modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 213, 221, 0.3) transparent;
}

.tm-add-section {
  padding: 15px 20px;
  background: #383838;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.tm-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  background: #222;
  border: 1px solid #444;
  color: #eee;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.tm-input:focus {
  border-color: #00d5d3;
}

.tm-btn-add {
  padding: 8px 16px;
  background: #444;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
  white-space: nowrap;
}

.tm-btn-add:hover {
  background: #818181;
  color: #000;
}

.tm-manage-list {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  max-height: 500px;
}

.tm-manage-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.tm-manage-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.tm-manage-row.disabled {
  opacity: 0.5;
}

.tm-manage-row.disabled .tm-name {
  text-decoration: line-through;
  color: #777;
}

.tm-manage-row.pinned-top {
  background: rgba(0, 213, 221, 0.05);
}

.tm-manage-row.pinned-top::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #00d5d3;
}

.tm-info {
  flex: 1;
  overflow: hidden;
}

.tm-name {
  color: #eee;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tm-url {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
}

.tm-btn-delete,
.tm-btn-pin {
  background: none;
  border: none;
  color: #aaa;
  font-size: 16px;
  cursor: pointer;
  padding: 5px;
  margin-left: 5px;
  transition: 0.2s;
}

.tm-btn-delete:hover {
  color: #ff6666;
  transform: scale(1.1);
}

.tm-btn-pin:hover {
  color: #00d5d3;
  transform: scale(1.1);
}

.tm-switch-label {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin-left: 15px;
  flex-shrink: 0;
}

.tm-switch-label input {
  opacity: 0;
  width: 0;
  height: 0;
}

.tm-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #555;
  transition: .4s;
  border-radius: 20px;
}

.tm-switch-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked+.tm-switch-slider {
  background-color: #00d5d3;
}

input:checked+.tm-switch-slider:before {
  transform: translateX(14px);
}

.tm-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #333;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.tm-btn-danger {
  background: rgba(255, 68, 68, 0.2);
  color: #ff6666;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.tm-btn-primary {
  background: linear-gradient(135deg, #00d5d3 0%, #00ff5c 100%);
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.tm-setting-group {
  padding: 15px 20px;
}

.tm-setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.tm-setting-label {
  color: #eee;
  font-size: 14px;
}

.tm-setting-desc {
  color: #888;
  font-size: 12px;
  line-height: 1.4;
}

.tm-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 10px 0;
}

.tm-tag-current {
  display: inline-block;
  background: #00d5d3;
  color: #000;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 5px;
}

.tm-current-site {
  background: rgba(0, 213, 221, 0.05);
  border-left: 2px solid #00d5d3;
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
