<script setup lang="ts">
import { onMounted } from 'vue';
import { configManager } from '../content/utils/config';

// Initialize config manager when popup opens
onMounted(async () => {
  await configManager.init();
});

function toggleExtension() {
  configManager.state.enabled = !configManager.state.enabled;
  configManager.save();
}

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('src/options/index.html'));
  }
}
</script>

<template>
  <div class="popup-container">
    <div class="content">
      <div class="card status-card">
        <div class="status-header">
          <span>功能状态</span>
          <label class="switch">
            <input type="checkbox" :checked="configManager.state.enabled" @change="toggleExtension">
            <span class="slider round"></span>
          </label>
        </div>
        <p class="status-desc" :class="{ 'active': configManager.state.enabled }">
          {{ configManager.state.enabled ? '已启用 - 可以在视频页面看到悬浮球' : '已禁用 - 悬浮球已隐藏' }}
        </p>
      </div>
    </div>

    <div class="header">
      <img src="/logo.png" alt="Golan Cinema" class="logo" />
      <div class="title-section">
        <span>{{ configManager.state.name }}</span>
        <span class="version">v{{ configManager.state.version }}</span>
      </div>
      <div class="setting-icon" @click="openOptions" title="设置">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  padding: 0;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #1a1a1a;
  color: #eee;
  width: max-content;
  min-width: none;
}

.popup-container {
  padding-bottom: 10px;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.logo {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.title-section h2 {
  margin: 0;
  font-size: 18px;
  color: white;
  display: flex;
  flex-direction: row;
}

.version {
  font-size: 12px;
  color: #666;
  margin-left: 10px;
}

.setting-icon {
  margin-left: auto;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.setting-icon:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.card {
  background: #2b2b2b;
  border-radius: 15px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #333;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.status-desc {
  margin: 0;
  font-size: 12px;
  color: #777;
  transition: color 0.3s;
}

.status-desc.active {
  color: #00d5d3;
}

.info-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #ccc;
}

.info-card ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.info-card li {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
  line-height: 1.4;
}

.github-btn {
  width: 100%;
  padding: 10px;
  background: #333;
  color: #fff;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.github-btn:hover {
  background: #444;
  border-color: #666;
}

.icon {
  color: #ffd700;
}

/* Switch CSS */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked+.slider {
  background-color: #00d5d1ad;
}

input:checked+.slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
