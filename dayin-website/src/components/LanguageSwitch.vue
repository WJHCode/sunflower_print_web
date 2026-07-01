<script setup lang="ts">
import { GlobalOutlined } from '@ant-design/icons-vue';
import { useI18n, type Language } from '@/i18n';

const { language, t, setLanguage } = useI18n();

const handleChange = (value: Language) => {
  setLanguage(value);
};
</script>

<template>
  <a-select
    class="language-switch"
    popup-class-name="language-switch-dropdown"
    :value="language"
    :aria-label="t('common.language')"
    size="small"
    @change="handleChange"
  >
    <template #suffixIcon><GlobalOutlined /></template>
    <a-select-option value="zh">{{ t('common.chinese') }}</a-select-option>
    <a-select-option value="en">{{ t('common.english') }}</a-select-option>
  </a-select>
</template>

<style scoped>
.language-switch {
  min-width: 112px;
}

@media (max-width: 768px) {
  .language-switch {
    min-width: 104px;
  }

  .language-switch :deep(.ant-select-selector),
  .language-switch :deep(.ant-select-selection-item),
  .language-switch :deep(.ant-select-selection-search-input) {
    font-size: 16px !important;
  }

  .language-switch :deep(.ant-select-selector) {
    min-height: 34px !important;
    align-items: center;
  }
}

:global(.language-switch-dropdown),
:global(.language-switch-dropdown .ant-select-item),
:global(.language-switch-dropdown .ant-select-item-option-content),
:global(.language-switch-dropdown .ant-select-selection-search-input) {
  font-size: 16px !important;
}
</style>
