<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@/i18n';

interface Props {
  pageId?: string;
  pageTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageId: '',
  pageTitle: ''
});

const route = useRoute();
const { language, t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);

// Environment variables with fallback to Cusdis documentation demo App ID
const appId = import.meta.env.VITE_CUSDIS_APP_ID || '35b01c49-15f9-46b3-807f-9240f6cadc1a';
const host = import.meta.env.VITE_CUSDIS_HOST || 'https://cusdis.com';

const resolvedPageId = ref('');
const resolvedPageTitle = ref('');
const resolvedPageUrl = ref('');

let heightSyncInterval: any = null;
let bodyObserver: MutationObserver | null = null;

const updatePageMeta = () => {
  resolvedPageId.value = props.pageId || route.path;
  resolvedPageTitle.value = props.pageTitle || document.title || t('common.brand');
  resolvedPageUrl.value = window.location.href;
};

const updateCusdisLocale = () => {
  (window as any).CUSDIS_LOCALE = language.value === 'zh'
    ? {
      powered_by: '评论由 Cusdis 提供',
      post_comment: '发送',
      loading: '加载中',
      email: '电子邮箱 (可选)',
      nickname: '昵称 (必填)',
      reply_placeholder: '回复内容…',
      reply_btn: '回复',
      sending: '发送中…',
      mod_badge: '管理员',
      content_is_required: '内容不能为空',
      nickname_is_required: '昵称不能为空',
      comment_has_been_sent: '评论已发送，管理员审核通过后会展示'
    }
    : {
      powered_by: 'Comments by Cusdis',
      post_comment: 'Send',
      loading: 'Loading',
      email: 'Email (optional)',
      nickname: 'Nickname (required)',
      reply_placeholder: 'Write a reply...',
      reply_btn: 'Reply',
      sending: 'Sending...',
      mod_badge: 'Admin',
      content_is_required: 'Content is required',
      nickname_is_required: 'Nickname is required',
      comment_has_been_sent: 'Comment sent. It will appear after moderation.'
    };
};

// Directly sync iframe height by inspecting its DOM (bulletproof for same-origin srcdoc iframe)
const syncIframeHeight = () => {
  const iframe = containerRef.value?.querySelector('iframe');
  if (!iframe) return;

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      // Use scrollHeight of the documentElement / body
      const height = doc.documentElement.scrollHeight || doc.body?.scrollHeight;
      if (height && height > 50) { // arbitrary threshold to avoid collapsed states
        iframe.style.height = height + 'px';
      }
    }
  } catch (err) {
    // Cross-origin fallback (should not happen for srcdoc, but good practice)
  }
};

// Set up MutationObserver inside the iframe
const setupIframeObserver = () => {
  const iframe = containerRef.value?.querySelector('iframe');
  if (!iframe) return;

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.body) {
      if (bodyObserver) {
        bodyObserver.disconnect();
      }
      bodyObserver = new MutationObserver(() => {
        syncIframeHeight();
      });
      bodyObserver.observe(doc.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
      syncIframeHeight();
    }
  } catch (err) {
    // Ignore
  }
};

// Handle Cusdis iframe postMessages to dynamically resize iframe height
const handleMessage = (e: MessageEvent) => {
  try {
    const msg = JSON.parse(e.data);
    if (msg.from === 'cusdis') {
      if (msg.event === 'resize' && msg.data) {
        const iframe = containerRef.value?.querySelector('iframe');
        if (iframe) {
          iframe.style.height = msg.data + 'px';
        }
      }
    }
  } catch (err) {
    // Ignore non-JSON messages
  }
};

const loadCusdisScript = () => {
  return new Promise<void>((resolve) => {
    updateCusdisLocale();

    // Prevent initial automatic render to avoid race conditions and double-rendering the singleton iframe
    (window as any).CUSDIS_PREVENT_INITIAL_RENDER = true;

    // If global CUSDIS is already loaded, resolve immediately
    if ((window as any).CUSDIS) {
      resolve();
      return;
    }

    // Load the core Cusdis script directly
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

    // Prevent nested iframe scrollbars by setting scrolling="no" and overflow="hidden"
    nextTick(() => {
      const iframe = containerRef.value?.querySelector('iframe');
      if (iframe) {
        iframe.setAttribute('scrolling', 'no');
        iframe.style.overflow = 'hidden';
        
        // Setup direct listeners on the iframe
        iframe.addEventListener('load', () => {
          syncIframeHeight();
          setupIframeObserver();
        });
        
        // Run once immediately (in case load event already fired)
        syncIframeHeight();
        setupIframeObserver();
      }
    });
  }
};

onMounted(async () => {
  window.addEventListener('message', handleMessage);
  await loadCusdisScript();
  renderComments();
  
  // Set up a polling backup to keep height correct during dynamic content shifts
  heightSyncInterval = setInterval(syncIframeHeight, 500);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
  if (heightSyncInterval) {
    clearInterval(heightSyncInterval);
  }
  if (bodyObserver) {
    bodyObserver.disconnect();
  }
});

// Watch route or props to trigger re-rendering for SPA navigation
watch(
  () => [route.path, props.pageId, language.value],
  () => {
    updateCusdisLocale();
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
      :data-page-id="resolvedPageId"
      :data-page-url="resolvedPageUrl"
      :data-page-title="resolvedPageTitle"
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
