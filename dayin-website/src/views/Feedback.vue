<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessageOutlined, BulbOutlined, BugOutlined, UserOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface Comment {
  id: number;
  nickname: string;
  email?: string;
  content: string;
  createdAt: string;
}

const commentsList = ref<Comment[]>([]);
const commentForm = ref({
  nickname: '',
  email: '',
  content: ''
});

// Load comments from localStorage or initialize with mock data
onMounted(() => {
  const saved = localStorage.getItem('dayin_comments_v2');
  if (saved) {
    commentsList.value = JSON.parse(saved);
  } else {
    // Initial mock comments
    commentsList.value = [
      {
        id: 1,
        nickname: '天天向上',
        content: '向日葵打印非常好用，希望能增加更多的一年级数学口算题型！',
        createdAt: '2026-06-12 10:24'
      },
      {
        id: 2,
        nickname: '豆豆妈妈',
        content: '这个网站的排版非常干净，下载 PDF 打印出来效果特别好，给作者赞一个！',
        createdAt: '2026-06-14 15:30'
      }
    ];
    localStorage.setItem('dayin_comments_v2', JSON.stringify(commentsList.value));
  }
});

const submitComment = () => {
  const nickname = commentForm.value.nickname.trim();
  const email = commentForm.value.email.trim();
  const content = commentForm.value.content.trim();

  if (!nickname) {
    message.warning('请输入您的昵称');
    return;
  }
  if (!content) {
    message.warning('请输入留言内容');
    return;
  }

  // Basic email validation if entered
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.warning('请输入格式正确的邮箱地址');
    return;
  }
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newMsg: Comment = {
    id: Date.now(),
    nickname,
    email: email || undefined,
    content,
    createdAt: dateStr
  };
  
  commentsList.value.unshift(newMsg);
  localStorage.setItem('dayin_comments_v2', JSON.stringify(commentsList.value));
  
  // Clear only content after submission, keep nickname/email for convenience
  commentForm.value.content = '';
  message.success('留言发表成功');
};
</script>

<template>
  <div class="feedback-view">
    <div class="feedback-header-card">
      <div class="header-title-row">
        <span class="header-icon"><MessageOutlined /></span>
        <h2>留言与建议</h2>
      </div>
      <p class="intro-text">
        向日葵打印致力于为家长和老师提供纯净、简单、好打印的练习纸生成工具。如果您在使用过程中遇到任何问题，或者有想要增加的模板、好玩的想法，欢迎在下方给我们留言！
      </p>
      
      <div class="features-grid">
        <div class="feature-item">
          <span class="item-icon bulb"><BulbOutlined /></span>
          <div class="item-text">
            <h3>新模板提案</h3>
            <p>告诉我们您需要的数学练习、拼音描红或创意笔记格式。</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="item-icon bug"><BugOutlined /></span>
          <div class="item-text">
            <h3>缺陷反馈</h3>
            <p>遇到排版错乱、PDF 无法下载或计算题公式错误？请随时指出。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 留言表单卡片 -->
    <div class="comments-section-card">
      <div class="write-comment-title">发表留言</div>
      <div class="comment-form">
        <!-- 昵称与邮箱表单行 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span>昵称</span>
              <span class="required-tag">*</span>
            </label>
            <a-input 
              v-model:value="commentForm.nickname" 
              placeholder="请输入您的公开昵称" 
              maxLength="20"
            />
            <div class="form-hint">将在留言列表中公开展示。建议使用匿名昵称，保护您的隐私。</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>电子邮箱</span>
              <span class="optional-tag">(可选)</span>
            </label>
            <a-input 
              v-model:value="commentForm.email" 
              placeholder="example@email.com" 
              maxLength="50"
            />
            <div class="form-hint">仅用于作者答复您或留言审核通过时接收邮件通知，绝不对外公开。</div>
          </div>
        </div>

        <!-- 留言内容 -->
        <div class="form-group message-group">
          <label class="form-label">
            <span>留言内容</span>
            <span class="required-tag">*</span>
          </label>
          <a-textarea 
            v-model:value="commentForm.content" 
            placeholder="写下您的建议、问题反馈或新模板想法..." 
            :rows="4" 
            class="comment-textarea"
            maxLength="500"
          />
          <div class="form-actions">
            <span class="limit-tip">最多输入 500 字</span>
            <a-button type="primary" class="submit-btn" @click="submitComment">发表留言</a-button>
          </div>
        </div>
      </div>

      <!-- 留言列表 -->
      <div class="comments-list-section">
        <div class="list-header">全部留言 ({{ commentsList.length }})</div>
        <div v-if="commentsList.length === 0" class="empty-comments">
          暂无留言，快来留下第一条吧～
        </div>
        <div v-else class="comments-list">
          <div v-for="item in commentsList" :key="item.id" class="comment-item">
            <div class="comment-avatar">
              <UserOutlined />
            </div>
            <div class="comment-content-box">
              <div class="comment-meta">
                <span class="comment-author">{{ item.nickname }}</span>
                <span class="comment-time">{{ item.createdAt }}</span>
              </div>
              <div class="comment-text">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
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

.comment-form {
  margin-bottom: 36px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #334235;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-tag {
  color: #ff4d4f;
}

.optional-tag {
  font-size: 12px;
  color: #8c968e;
  font-weight: normal;
}

.form-hint {
  font-size: 12px;
  line-height: 1.5;
  color: #8c968e;
}

.message-group {
  margin-top: 12px;
}

.comment-textarea {
  border-radius: 8px;
  border-color: rgba(58, 74, 62, 0.15);
  background: #fff;
  transition: all 0.2s;
}

.comment-textarea:focus, 
.comment-textarea:hover {
  border-color: #2f7d46;
  box-shadow: 0 0 0 2px rgba(47, 125, 70, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.limit-tip {
  font-size: 12px;
  color: #8c968e;
}

.submit-btn {
  background-color: #1677ff !important;
  border-color: #1677ff !important;
  color: #ffffff !important;
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 20px;
  height: 36px;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: #4096ff !important;
  border-color: #4096ff !important;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}

.comments-list-section {
  border-top: 1px solid rgba(58, 74, 62, 0.1);
  padding-top: 28px;
}

.list-header {
  font-size: 16px;
  font-weight: 700;
  color: #233126;
  margin-bottom: 20px;
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
  color: #8c968e;
  font-size: 14px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(58, 74, 62, 0.06);
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f3ea;
  color: #2f7d46;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.comment-content-box {
  flex: 1;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  font-weight: 600;
  color: #334235;
}

.comment-time {
  font-size: 12px;
  color: #8c968e;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5b4d;
  word-break: break-all;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .feedback-header-card,
  .comments-section-card {
    padding: 20px;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
