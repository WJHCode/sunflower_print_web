<script setup lang="ts">
import WalineComments from '@/components/WalineComments.vue';
import { MessageOutlined, BulbOutlined, BugOutlined } from '@ant-design/icons-vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();
</script>

<template>
  <div class="feedback-view">
    <div class="feedback-header-card">
      <div class="header-title-row">
        <span class="header-icon"><MessageOutlined /></span>
        <h2>{{ t('feedback.title') }}</h2>
      </div>
      <p class="intro-text">
        {{ t('feedback.intro') }}
      </p>
      
      <div class="features-grid">
        <div class="feature-item">
          <span class="item-icon bulb"><BulbOutlined /></span>
          <div class="item-text">
            <h3>{{ t('feedback.templateTitle') }}</h3>
            <p>{{ t('feedback.templateText') }}</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="item-icon bug"><BugOutlined /></span>
          <div class="item-text">
            <h3>{{ t('feedback.bugTitle') }}</h3>
            <p>{{ t('feedback.bugText') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Waline 评论组件 -->
    <div class="comments-section-card">
      <div class="write-comment-title">{{ t('feedback.writeComment') }}</div>
      <WalineComments page-id="/generator/feedback" />
    </div>
  </div>
</template>

<style scoped>
.feedback-view {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.feedback-header-card {
  background: #fffdf7;
  border: 1px solid rgba(58, 74, 62, 0.12);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(60, 54, 38, 0.04);
  margin-bottom: 24px;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: #e8f3ea;
  color: #2f7d46;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.header-title-row h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #233126;
}

.intro-text {
  font-size: 15px;
  line-height: 1.8;
  color: #5a665b;
  margin-bottom: 28px;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border-top: 1px dashed rgba(58, 74, 62, 0.15);
  padding-top: 24px;
}

.feature-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.item-icon.bulb {
  background: #fbf5e6;
  color: #8c6c1f;
}

.item-icon.bug {
  background: #f8ece7;
  color: #ad5546;
}

.item-text h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #233126;
}

.item-text p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6d786e;
}

.comments-section-card {
  background: #fffdf7;
  border: 1px solid rgba(58, 74, 62, 0.12);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(60, 54, 38, 0.04);
}

.write-comment-title {
  font-size: 18px;
  font-weight: 700;
  color: #233126;
  margin-bottom: 20px;
  border-left: 4px solid #2f7d46;
  padding-left: 10px;
}

@media (max-width: 768px) {
  .feedback-header-card,
  .comments-section-card {
    padding: 20px;
  }
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
