<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { init, type WalineInstance } from '@waline/client';
import '@waline/client/waline.css';
import { useI18n } from '@/i18n';

interface Props {
  pageId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageId: ''
});

const WALINE_SERVER_URL = 'https://waline.uucc.me';

const route = useRoute();
const { language } = useI18n();
const containerRef = ref<HTMLElement | null>(null);
let waline: WalineInstance | null = null;

const pagePath = () => props.pageId || route.path;
const walineLanguage = () => language.value === 'zh' ? 'zh-CN' : 'en';

onMounted(() => {
  waline = init({
    el: containerRef.value,
    serverURL: WALINE_SERVER_URL,
    path: pagePath(),
    lang: walineLanguage(),
    imageUploader: false
  });
});

watch(
  () => [route.path, props.pageId, language.value],
  () => {
    waline?.update({
      path: pagePath(),
      lang: walineLanguage()
    });
  }
);

onUnmounted(() => {
  waline?.destroy();
  waline = null;
});
</script>

<template>
  <div ref="containerRef" class="waline-comments-container"></div>
</template>

<style scoped>
.waline-comments-container {
  width: 100%;
  min-height: 200px;
}
</style>
