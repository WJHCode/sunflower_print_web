<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  pageId?: string;
  pageTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageId: '',
  pageTitle: ''
});

const route = useRoute();
const containerRef = ref<HTMLDivElement | null>(null);

// Environment variables with fallback to Cusdis documentation demo App ID
const appId = import.meta.env.VITE_CUSDIS_APP_ID || '35b01c49-15f9-46b3-807f-9240f6cadc1a';
const host = import.meta.env.VITE_CUSDIS_HOST || 'https://cusdis.com';

const pageId = ref('');
const pageTitle = ref('');
const pageUrl = ref('');

const updatePageMeta = () => {
  pageId.value = props.pageId || route.path;
  pageTitle.value = props.pageTitle || document.title || '向日葵打印';
  pageUrl.value = window.location.href;
};

const loadCusdisScript = () => {
  return new Promise<void>((resolve) => {
    // If global CUSDIS is already loaded, resolve immediately
    if ((window as any).CUSDIS) {
      resolve();
      return;
    }

    // 1. Load Chinese translation script
    const langScript = document.createElement('script');
    langScript.src = `${host}/js/widget/lang/zh-cn.js`;
    langScript.defer = true;
    document.head.appendChild(langScript);

    // 2. Load the core Cusdis script
    const sdkScript = document.createElement('script');
    sdkScript.src = `${host}/js/cusdis.es.js`;
    sdkScript.async = true;
    sdkScript.defer = true;
    sdkScript.onload = () => resolve();
    document.head.appendChild(sdkScript);
  });
};

const renderComments = async () => {
  updatePageMeta();
  await nextTick();
  
  if (containerRef.value && (window as any).CUSDIS) {
    // Clear the container first to avoid duplicate frames
    containerRef.value.innerHTML = '';
    
    // Call the Cusdis renderTo method which reads the data attributes from target
    (window as any).CUSDIS.renderTo(containerRef.value);
  }
};

onMounted(async () => {
  await loadCusdisScript();
  renderComments();
});

// Watch route or props to trigger re-rendering for SPA navigation
watch(
  () => [route.path, props.pageId],
  () => {
    renderComments();
  }
);
</script>

<template>
  <div class="cusdis-comments-container">
    <div 
      ref="containerRef"
      id="cusdis_thread"
      class="cusdis-thread"
      :data-host="host"
      :data-app-id="appId"
      :data-page-id="pageId"
      :data-page-url="pageUrl"
      :data-page-title="pageTitle"
    ></div>
  </div>
</template>

<style scoped>
.cusdis-comments-container {
  width: 100%;
  margin-top: 24px;
}
.cusdis-thread {
  min-height: 200px;
  width: 100%;
}
</style>
