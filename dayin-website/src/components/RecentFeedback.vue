<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { MessageOutlined, RightOutlined } from '@ant-design/icons-vue';
import { getRecentComment, type RecentCommentData } from '@waline/client';
import { useRouter } from 'vue-router';
import { useI18n } from '@/i18n';

const WALINE_SERVER_URL = 'https://waline.uucc.me';
const COMMENT_COUNT = 10;
const FEEDBACK_ROW_HEIGHT = 98;

const router = useRouter();
const { t, language } = useI18n();
const comments = ref<RecentCommentData[]>([]);
const reelIndex = ref(0);
const isPaused = ref(false);
const shouldAnimate = ref(true);
const prefersReducedMotion = ref(false);

let abortController: AbortController | null = null;
let rotationTimer: ReturnType<typeof window.setInterval> | null = null;
let reducedMotionQuery: MediaQueryList | null = null;

const visibleComments = computed(() => [
  ...comments.value,
  ...comments.value.slice(0, Math.min(3, comments.value.length)),
]);

const canRotate = computed(() => comments.value.length > 1 && !prefersReducedMotion.value && !isPaused.value);

const cleanComment = (comment: string) => {
  if (typeof window === 'undefined') return comment.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const document = new DOMParser().parseFromString(comment, 'text/html');
  return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
};

const formatTime = (time: number) => {
  const diffMinutes = Math.round((time - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat(language.value === 'zh' ? 'zh-CN' : 'en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

  return formatter.format(Math.round(diffHours / 24), 'day');
};

const goToFeedback = () => {
  router.push('/generator/feedback');
};

const stopRotation = () => {
  if (rotationTimer !== null) {
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  }
};

const resetReel = () => {
  shouldAnimate.value = false;
  reelIndex.value = 0;
  window.requestAnimationFrame(() => {
    shouldAnimate.value = true;
  });
};

const advanceReel = () => {
  if (!canRotate.value) return;
  reelIndex.value += 1;
};

const startRotation = () => {
  stopRotation();
  if (!canRotate.value) return;
  rotationTimer = window.setInterval(advanceReel, 2000);
};

const handleTransitionEnd = () => {
  if (comments.value.length && reelIndex.value >= comments.value.length) resetReel();
};

const pauseRotation = () => {
  isPaused.value = true;
  stopRotation();
};

const resumeRotation = () => {
  isPaused.value = false;
  startRotation();
};

const updateReducedMotionPreference = () => {
  prefersReducedMotion.value = reducedMotionQuery?.matches ?? false;
  startRotation();
};

const loadComments = async () => {
  abortController?.abort();
  abortController = new AbortController();

  try {
    const response = await getRecentComment({
      serverURL: WALINE_SERVER_URL,
      lang: language.value === 'zh' ? 'zh-CN' : 'en',
      count: COMMENT_COUNT,
      signal: abortController.signal,
    }) as unknown;

    const data = Array.isArray(response)
      ? response
      : Array.isArray((response as { data?: unknown }).data)
        ? (response as { data: RecentCommentData[] }).data
        : [];

    comments.value = data.filter((comment) => cleanComment(comment.comment).length > 0).slice(0, COMMENT_COUNT);
    resetReel();
    startRotation();
  } catch (error) {
    if ((error as Error).name !== 'AbortError') comments.value = [];
  }
};

watch(language, () => {
  void loadComments();
});

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionQuery.addEventListener('change', updateReducedMotionPreference);
  updateReducedMotionPreference();
  void loadComments();
});

onBeforeUnmount(() => {
  abortController?.abort();
  stopRotation();
  reducedMotionQuery?.removeEventListener('change', updateReducedMotionPreference);
});
</script>

<template>
  <section
    v-if="comments.length"
    class="recent-feedback-section"
    :aria-label="t('home.recentFeedback.label')"
  >
    <div class="recent-feedback-intro">
      <p class="recent-feedback-kicker"><MessageOutlined />{{ t('home.recentFeedback.label') }}</p>
      <h2>{{ t('home.recentFeedback.title') }}</h2>
      <p>{{ t('home.recentFeedback.description') }}</p>
      <button class="recent-feedback-action" type="button" @click="goToFeedback">
        {{ t('home.recentFeedback.action') }}
        <RightOutlined />
      </button>
    </div>

    <div
      class="recent-feedback-reel"
      @mouseenter="pauseRotation"
      @mouseleave="resumeRotation"
      @focusin="pauseRotation"
      @focusout="resumeRotation"
    >
      <div
        class="recent-feedback-track"
        :class="{ 'is-static': !shouldAnimate }"
        :style="{ transform: `translateY(-${reelIndex * FEEDBACK_ROW_HEIGHT}px)` }"
        @transitionend="handleTransitionEnd"
      >
        <button
          v-for="(comment, index) in visibleComments"
          :key="`${comment.objectId}-${index}`"
          class="recent-feedback-card"
          type="button"
          @click="goToFeedback"
        >
          <span class="recent-feedback-meta">
            <strong>{{ comment.nick || t('home.recentFeedback.user') }}</strong>
            <span>{{ comment.label || t('home.recentFeedback.user') }}</span>
            <time :datetime="new Date(comment.time).toISOString()">{{ formatTime(comment.time) }}</time>
          </span>
          <span class="recent-feedback-comment">{{ cleanComment(comment.comment) }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recent-feedback-section {
  width: min(1120px, calc(100% - 48px));
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(360px, 1.18fr);
  gap: clamp(32px, 7vw, 96px);
  align-items: center;
  margin: 18px auto 0;
  padding: 44px clamp(28px, 5vw, 56px);
  border: 1px solid rgba(58, 74, 62, 0.12);
  border-radius: 12px;
  background: linear-gradient(116deg, #f0f7ed 0%, #fffdf7 57%, #f8f4e8 100%);
  box-shadow: 0 16px 36px rgba(60, 54, 38, 0.07);
}

.recent-feedback-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  color: #47704d;
  font-size: 13px;
  font-weight: 800;
}

.recent-feedback-intro h2 {
  margin: 0;
  color: #253027;
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.28;
}

.recent-feedback-intro > p:not(.recent-feedback-kicker) {
  max-width: 340px;
  margin: 14px 0 0;
  color: #667068;
  line-height: 1.75;
}

.recent-feedback-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 22px;
  padding: 0;
  border: 0;
  color: #2f7d46;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
}

.recent-feedback-action:hover {
  color: #1f5e33;
}

.recent-feedback-reel {
  position: relative;
  height: 274px;
  overflow: hidden;
  padding: 8px 0;
}

.recent-feedback-reel::before,
.recent-feedback-reel::after {
  position: absolute;
  z-index: 1;
  right: 0;
  left: 0;
  height: 40px;
  content: '';
  pointer-events: none;
}

.recent-feedback-reel::before {
  top: 0;
  background: linear-gradient(to bottom, #fffdf7 4%, rgba(255, 253, 247, 0));
}

.recent-feedback-reel::after {
  bottom: 0;
  background: linear-gradient(to top, #fffdf7 4%, rgba(255, 253, 247, 0));
}

.recent-feedback-track {
  transition: transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
}

.recent-feedback-track.is-static {
  transition: none;
}

.recent-feedback-card {
  width: 100%;
  height: 88px;
  margin-bottom: 10px;
  padding: 15px 18px;
  display: grid;
  gap: 8px;
  overflow: hidden;
  border: 1px solid rgba(47, 125, 70, 0.13);
  border-radius: 10px;
  color: #253027;
  text-align: left;
  cursor: pointer;
  background: rgba(255, 253, 247, 0.9);
  box-shadow: 0 8px 22px rgba(60, 54, 38, 0.06);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.recent-feedback-card:hover,
.recent-feedback-card:focus-visible {
  border-color: rgba(47, 125, 70, 0.42);
  box-shadow: 0 12px 28px rgba(60, 54, 38, 0.11);
  outline: none;
  transform: translateX(2px);
}

.recent-feedback-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #718073;
  font-size: 12px;
}

.recent-feedback-meta strong {
  overflow: hidden;
  color: #334235;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-feedback-meta span {
  padding: 2px 6px;
  border-radius: 4px;
  color: #55755b;
  background: #edf5ea;
  white-space: nowrap;
}

.recent-feedback-meta time {
  margin-left: auto;
  white-space: nowrap;
}

.recent-feedback-comment {
  display: -webkit-box;
  overflow: hidden;
  color: #5c685e;
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 860px) {
  .recent-feedback-section {
    grid-template-columns: 1fr;
    gap: 22px;
    margin-top: 12px;
    padding: 32px 22px;
  }

  .recent-feedback-intro > p:not(.recent-feedback-kicker) {
    max-width: none;
  }

  .recent-feedback-reel {
    height: 250px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .recent-feedback-track,
  .recent-feedback-card {
    transition: none;
  }
}
</style>
