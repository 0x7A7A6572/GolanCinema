
import { reactive } from 'vue';
import { DEFAULT_PRESET, DEFAULT_SELECTORS, STORAGE_KEY } from './constants';
import pkg from '../../../package.json'
export interface ParserItem {
  name: string;
  url: string;
  enabled?: boolean;
  pinned?: boolean;
}

export interface SiteSelector {
  host: string;
  selector: string;
}

export interface Config {
  name: string;
  parserList: ParserItem[];
  embedPlay: boolean;
  siteSelectors: SiteSelector[];
  version: string;
  enabled: boolean;
}

const defaultConfig: Config = {
  name: pkg.name,
  parserList: DEFAULT_PRESET.map((p) => ({ ...p, enabled: true })),
  embedPlay: true,
  siteSelectors: JSON.parse(JSON.stringify(DEFAULT_SELECTORS)),
  version: pkg.version,
  enabled: true,
};

class ConfigManager {
  state = reactive<Config>({ ...defaultConfig });

  async init() {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      const data = result[STORAGE_KEY];
      if (data) {
        this.mergeConfig(data);
      }

      // Listen for changes
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          const newValue = changes[STORAGE_KEY].newValue;
          if (newValue) {
            this.mergeConfig(newValue);
          } else {
            // If newValue is undefined/null, it means the key was removed (reset)
            // Re-apply defaults
            this.state.parserList = DEFAULT_PRESET.map((p) => ({ ...p, enabled: true }));
            this.state.siteSelectors = JSON.parse(JSON.stringify(DEFAULT_SELECTORS));
            this.state.embedPlay = true;
            this.state.enabled = true;
          }
        }
      });
    } catch (e) {
      console.error('[Golan Config] Init error:', e);
    }
  }

  mergeConfig(data: any) {
    if (!data) return;

    // Handle legacy format or string format if necessary
    // Assuming data is object as we use chrome.storage directly

    let loadedList: ParserItem[] = [];
    if (data.parserList && Array.isArray(data.parserList)) {
      loadedList = data.parserList;
    } else if (data.list && Array.isArray(data.list)) {
      // Legacy
      loadedList = data.list;
    }

    if (loadedList.length > 0) {
      this.state.parserList = loadedList.filter(
        (p) => p !== null && p !== undefined
      );
    }

    if (typeof data.embedPlay === 'boolean') this.state.embedPlay = data.embedPlay;
    if (typeof data.enabled === 'boolean') this.state.enabled = data.enabled;
    if (data.siteSelectors && Array.isArray(data.siteSelectors)) {
      this.state.siteSelectors = data.siteSelectors;
    }
  }

  async save() {
    const dataToSave = {
      parserList: JSON.parse(JSON.stringify(this.state.parserList)), // unwrap reactive
      embedPlay: this.state.embedPlay,
      enabled: this.state.enabled,
      siteSelectors: JSON.parse(JSON.stringify(this.state.siteSelectors)),
      version: pkg.version,
    };
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: dataToSave });
    } catch (e) {
      console.error('[Golan Config] Save error:', e);
    }
  }

  async reset() {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      Object.assign(this.state, defaultConfig);
      // Re-apply defaults to ensure deep copy
      this.state.parserList = DEFAULT_PRESET.map((p) => ({ ...p, enabled: true }));
      this.state.siteSelectors = JSON.parse(JSON.stringify(DEFAULT_SELECTORS));
      this.state.embedPlay = true;
      this.state.enabled = true;
    } catch (e) {
      console.error('[Golan Config] Reset error:', e);
    }
  }
}

export const configManager = new ConfigManager();
