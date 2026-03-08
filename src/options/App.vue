
<script setup lang="ts">
import { onMounted } from 'vue';
import { configManager } from '../content/utils/config';
import SettingsModal from '../content/components/SettingsModal.vue';

// We reuse the SettingsModal as the main content of the options page
// But we need to style it to fit the full page

onMounted(async () => {
  await configManager.init();
});

</script>

<template>
  <div class="options-container">
    <div class="options-wrapper">
      <!-- 
        Reusing SettingsModal but always showing it.
        We might need to adjust styles slightly or just use the inner content.
        However, SettingsModal is designed as a modal.
        For now, let's wrap it and force it to be visible.
      -->
      <SettingsModal 
        :show="true" 
        :is-full-page="true"
        @close="() => {}" 
        class="embedded-modal"
      />
    </div>
  </div>
</template>

<style scoped>
.options-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #1a1a1a;
}

.options-wrapper {
  width: 100%;
  /* max-width: 800px; */
}
</style>
