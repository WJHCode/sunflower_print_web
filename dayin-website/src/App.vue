<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<style>
/* Remove default vite styles */
body {
  margin: 0;
  padding: 0;
  background-color: #f7f5ef;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

:root {
  --print-theme-color: #2f7d46;
  --print-theme-color-hover: #235d34;
  --print-theme-color-soft: #e8f3ea;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .action-buttons .ant-btn-primary {
  background: var(--print-theme-color) !important;
  border-color: var(--print-theme-color) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .action-buttons .ant-btn-primary:hover,
:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .action-buttons .ant-btn-primary:focus {
  background: var(--print-theme-color-hover) !important;
  border-color: var(--print-theme-color-hover) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background: var(--print-theme-color) !important;
  border-color: var(--print-theme-color) !important;
  color: #ffffff !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
  background: var(--print-theme-color-hover) !important;
  border-color: var(--print-theme-color-hover) !important;
  color: #ffffff !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-radio-button-wrapper:hover,
:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-select-focused .ant-select-selector,
:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-input:focus,
:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-input-number-focused {
  border-color: var(--print-theme-color) !important;
  color: var(--print-theme-color);
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-switch.ant-switch-checked {
  background: var(--print-theme-color) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-switch.ant-switch-checked:hover {
  background: var(--print-theme-color-hover) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-slider-track {
  background: var(--print-theme-color) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-slider-handle::after {
  box-shadow: 0 0 0 2px var(--print-theme-color) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-checkbox-checked .ant-checkbox-inner {
  background: var(--print-theme-color) !important;
  border-color: var(--print-theme-color) !important;
}

:where(
  .generator-container,
  .english-container,
  .chinese-container,
  .sticker-container,
  .music-generator-view
) .settings-panel .ant-tag-blue {
  color: var(--print-theme-color);
  background: var(--print-theme-color-soft);
  border-color: #cde4d1;
}

@media (max-width: 768px) {
  html,
  body,
  #app {
    min-width: 0;
    overflow-x: hidden;
  }

  .settings-panel .ant-select,
  .settings-panel .ant-select-selector,
  .settings-panel .ant-select-selection-item,
  .settings-panel .ant-select-selection-placeholder,
  .ant-select-dropdown,
  .ant-select-dropdown .ant-select-item,
  .ant-select-dropdown .ant-select-selection-search-input {
    font-size: 16px !important;
  }
}

@media print {
  html,
  body,
  #app {
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    background: #fff !important;
  }

  body:has(#printable-paper),
  body:has(#english-printable-paper),
  body:has(#drawing-printable-paper),
  body:has(#chinese-printable-paper .paper-container:only-child) {
    width: 210mm !important;
    height: 296mm !important;
    max-height: 296mm !important;
    overflow: hidden !important;
  }

  body:has(#printable-paper) #app,
  body:has(#english-printable-paper) #app,
  body:has(#drawing-printable-paper) #app,
  body:has(#chinese-printable-paper .paper-container:only-child) #app {
    height: 296mm !important;
    max-height: 296mm !important;
    overflow: hidden !important;
  }
}
</style>
