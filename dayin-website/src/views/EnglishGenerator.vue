<script setup lang="ts">
import { computed, ref } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type EnglishPaperType =
  | 'english-paper'
  | 'month-words'
  | 'word-tracing'
  | 'paragraph-tracing'
  | 'alphabet-tracing';

const paperType = ref<EnglishPaperType>('english-paper');
const wordText = ref('apple\nbook\ncake\ndesk\nfamily\nschool');
const paragraphText = ref('Spring is warm. The sun shines on the trees. We read, write, and play with friends.');
const paragraphTitle = ref('Unit 1 Making friends');
const paragraphSubtitle = ref('How do we make friends?');

const englishLineRows = Array.from({ length: 18 }, (_, index) => index + 1);
const months = [
  { text: 'January', note: '一月' },
  { text: 'February', note: '二月' },
  { text: 'March', note: '三月' },
  { text: 'April', note: '四月' },
  { text: 'May', note: '五月' },
  { text: 'June', note: '六月' },
  { text: 'July', note: '七月' },
  { text: 'August', note: '八月' },
  { text: 'September', note: '九月' },
  { text: 'October', note: '十月' },
  { text: 'November', note: '十一月' },
  { text: 'December', note: '十二月' }
];
const alphabetPairs = Array.from({ length: 26 }, (_, index) => {
  const upper = String.fromCharCode(65 + index);
  return `${upper}${upper.toLowerCase()}`;
});
const alphabetColumns = [
  alphabetPairs.slice(0, 13),
  alphabetPairs.slice(13)
];
const wordTraceCopies = Array.from({ length: 2 }, (_, index) => index + 1);
const monthBlankCopies = Array.from({ length: 3 }, (_, index) => index + 1);
const wordBlankCopies = Array.from({ length: 4 }, (_, index) => index + 1);
const phoneticHints: Record<string, string> = {
  apple: '/ˈap(ə)l/',
  book: '/bʊk/',
  cake: '/keɪk/',
  desk: '/desk/',
  family: '/ˈfamɪli/',
  school: '/skuːl/'
};

const paperTitles: Record<EnglishPaperType, string> = {
  'english-paper': '英语作业纸',
  'month-words': '英语单词练习-月份',
  'word-tracing': '英文单词描红字帖（通用）',
  'paragraph-tracing': '英文段落描红字帖（通用）',
  'alphabet-tracing': '26个英文字母描红字帖'
};

const paperTitle = computed(() => paperTitles[paperType.value]);
const isEnglishPaper = computed(() => paperType.value === 'english-paper');
const isMonthWords = computed(() => paperType.value === 'month-words');
const isWordTracing = computed(() => paperType.value === 'word-tracing');
const isParagraphTracing = computed(() => paperType.value === 'paragraph-tracing');
const isAlphabetTracing = computed(() => paperType.value === 'alphabet-tracing');

const customWords = computed(() =>
  wordText.value
    .split(/[\n,，;；\s]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 10)
);

const customWordRows = computed(() =>
  customWords.value.map((word) => ({
    text: word,
    note: phoneticHints[word.toLowerCase()] ?? ''
  }))
);

const paragraphLines = computed(() => {
  const cleanText = paragraphText.value.replace(/\s+/g, ' ').trim();
  if (!cleanText) return [];

  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > 62 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 12);
});

const printPaper = () => {
  window.print();
};

const downloadPDF = () => {
  const element = document.getElementById('english-printable-paper');
  if (!element) return;
  element.classList.add('exporting');

  const opt = {
    margin: 0,
    filename: `${paperTitle.value}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['css'] }
  };

  html2pdf().set(opt).from(element).save().finally(() => {
    element.classList.remove('exporting');
  });
};
</script>

<template>
  <div class="english-container">
    <a-card class="settings-panel no-print" :bordered="false" title="生成设置">
      <a-form layout="vertical">
        <a-form-item label="题型">
          <a-select v-model:value="paperType">
            <a-select-option value="english-paper">英语作业纸</a-select-option>
            <a-select-option value="month-words">英语单词练习-月份</a-select-option>
            <a-select-option value="word-tracing">英文单词描红字帖（通用）</a-select-option>
            <a-select-option value="paragraph-tracing">英文段落描红字帖（通用）</a-select-option>
            <a-select-option value="alphabet-tracing">26个英文字母描红字帖</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="isWordTracing" label="练习单词">
          <a-textarea
            v-model:value="wordText"
            :rows="7"
            :maxlength="240"
            placeholder="最多 10 个英文单词，可用换行、空格或逗号分隔"
          />
          <div class="form-hint">当前生成 {{ customWords.length }} / 10 个单词</div>
        </a-form-item>

        <a-form-item v-if="isParagraphTracing" label="练习段落">
          <a-input
            v-model:value="paragraphTitle"
            :maxlength="80"
            placeholder="标题"
            style="margin-bottom: 8px"
          />
          <a-input
            v-model:value="paragraphSubtitle"
            :maxlength="100"
            placeholder="副标题"
            style="margin-bottom: 8px"
          />
          <a-textarea
            v-model:value="paragraphText"
            :rows="8"
            :maxlength="720"
            placeholder="输入一段英文短文"
          />
        </a-form-item>

        <a-form-item label="纸张">
          <a-tag color="blue">A4 纵向</a-tag>
        </a-form-item>
        <a-divider />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper">
            <template #icon><PrinterOutlined /></template>
            直接打印
          </a-button>
          <a-button block size="large" style="margin-top: 16px" @click="downloadPDF">
            <template #icon><DownloadOutlined /></template>
            下载 PDF
          </a-button>
        </div>
      </a-form>
    </a-card>

    <div class="preview-panel print-full-width">
      <div class="paper-stack" id="english-printable-paper">
        <div class="paper-container">
          <div v-if="isEnglishPaper" class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div v-if="isEnglishPaper" class="english-sheet">
            <div v-for="row in englishLineRows" :key="row" class="english-line">
              <svg viewBox="0 0 180 9" preserveAspectRatio="none" aria-hidden="true">
                <line x1="0" y1="0.25" x2="180" y2="0.25" stroke="#b8dcc4" stroke-width="0.35" />
                <line x1="0" y1="3" x2="180" y2="3" stroke="#b8dcc4" stroke-width="0.35" />
                <line x1="0" y1="6" x2="180" y2="6" stroke="#f0b3b3" stroke-width="0.35" />
                <line x1="0" y1="8.75" x2="180" y2="8.75" stroke="#b8dcc4" stroke-width="0.35" />
              </svg>
            </div>
          </div>

          <div v-else-if="isMonthWords" class="reference-sheet months-sheet">
            <h2 class="reference-main-title">英语单词练习-月份</h2>
            <p class="reference-subtitle">Months of the Year</p>
            <div v-for="month in months" :key="month.text" class="word-practice-row">
              <div class="reference-line word-line six-columns">
                <span class="trace-word sample">{{ month.text }}</span>
                <span v-for="copy in wordTraceCopies" :key="copy" class="trace-word faded">{{ month.text }}</span>
                <span v-for="blank in monthBlankCopies" :key="blank" class="trace-word blank" aria-hidden="true"></span>
              </div>
              <div class="row-note">{{ month.note }}</div>
            </div>
          </div>

          <div v-else-if="isWordTracing" class="reference-sheet word-sheet">
            <div class="reference-title-box">英文单词描红字帖（通用）</div>
            <div class="reference-info-row">
              <span>姓名</span><i></i>
              <span>日期</span><i></i>
              <span>用时</span><i></i>
            </div>
            <div v-for="word in customWordRows" :key="word.text" class="word-practice-row">
              <div class="reference-line word-line seven-columns">
                <span class="trace-word sample">{{ word.text }}</span>
                <span v-for="copy in wordTraceCopies" :key="copy" class="trace-word faded">{{ word.text }}</span>
                <span v-for="blank in wordBlankCopies" :key="blank" class="trace-word blank" aria-hidden="true"></span>
              </div>
              <div class="row-note">{{ word.note }}</div>
            </div>
            <div v-if="customWords.length === 0" class="empty-hint">请输入需要练习的英文单词</div>
          </div>

          <div v-else-if="isParagraphTracing" class="reference-sheet paragraph-sheet">
            <h3 v-if="paragraphTitle">{{ paragraphTitle }}</h3>
            <h4 v-if="paragraphSubtitle">{{ paragraphSubtitle }}</h4>
            <div class="paragraph-copy-area">
              <div v-for="(line, index) in paragraphLines" :key="`${line}-${index}`" class="reference-line paragraph-line">
                <span class="paragraph-copy">{{ line }}</span>
              </div>
            </div>
            <div v-if="paragraphLines.length === 0" class="empty-hint">请输入需要描红的英文段落</div>
          </div>

          <div v-else-if="isAlphabetTracing" class="reference-sheet alphabet-sheet">
            <h2 class="alphabet-title">26个英文字母描红字帖</h2>
            <div class="reference-info-row alphabet-info-row">
              <span>姓名</span><i></i>
              <span>日期</span><i></i>
              <span>用时</span><i></i>
            </div>
            <div class="alphabet-columns">
              <div v-for="(column, columnIndex) in alphabetColumns" :key="columnIndex" class="alphabet-column">
                <div v-for="pair in column" :key="pair" class="alphabet-practice-row">
                  <div class="reference-line alphabet-line four-columns">
                    <span class="trace-word sample">{{ pair }}</span>
                    <span class="trace-word faded">{{ pair }}</span>
                    <span class="trace-word faded">{{ pair }}</span>
                    <span class="trace-word faded">{{ pair }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.english-container {
  display: flex;
  gap: 24px;
  height: 100%;
}
.settings-panel {
  width: 320px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  overflow-y: auto;
}
.form-hint {
  margin-top: 6px;
  color: #8c8c8c;
  font-size: 12px;
}
.preview-panel {
  flex-grow: 1;
  background: #f0f2f5;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
}
.paper-stack {
  display: grid;
  gap: 24px;
}
.paper-stack.exporting {
  gap: 0;
}
.paper-container {
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
  background: white;
  padding: 15mm;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 4px;
}
.paper-stack.exporting .paper-container {
  height: 297mm;
  min-height: 297mm;
  box-shadow: none;
  border-radius: 0;
}
.paper-header h2 {
  text-align: center;
  font-size: 24px;
  font-family: "Kaiti", "STKaiti", serif;
  margin: 0 0 18px;
}
.paper-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
}
.english-sheet {
  display: grid;
  gap: 5.5mm;
  padding-top: 2mm;
}
.english-line {
  box-sizing: border-box;
  width: 180mm;
  height: 9mm;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}
.english-line svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}
.english-line line {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}
.reference-sheet {
  width: 180mm;
  padding-top: 18mm;
}
.months-sheet {
  padding-top: 4mm;
}
.reference-main-title,
.alphabet-title {
  margin: 0;
  color: #000;
  text-align: center;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0;
}
.reference-subtitle {
  margin: 2mm 0 7mm;
  color: #666;
  text-align: center;
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 15px;
  line-height: 1.4;
  letter-spacing: 0;
}
.reference-title-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 13mm;
  margin-bottom: 7mm;
  color: #000;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0;
}
.reference-info-row {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto 1fr;
  align-items: end;
  gap: 2mm;
  margin-bottom: 14mm;
  color: #000;
  font-size: 16px;
  line-height: 24px;
}
.alphabet-info-row {
  align-items: end;
  margin: 9mm 0 9mm;
  padding: 0;
  border: 0;
  font-size: 18px;
  line-height: 24px;
}
.reference-info-row i {
  display: block;
  height: 1px;
  border-bottom: 1px solid #000;
}
.word-practice-row,
.alphabet-practice-row {
  margin-bottom: 4.8mm;
}
.months-sheet .word-practice-row {
  margin-bottom: 3.4mm;
}
.reference-line {
  position: relative;
  display: grid;
  align-items: center;
  width: 100%;
  height: 10mm;
  overflow: hidden;
  background-image:
    linear-gradient(to bottom, #b8dcc4 0, #b8dcc4 1px, transparent 1px),
    linear-gradient(to bottom, transparent calc(33.333% - 0.5px), #b8dcc4 calc(33.333% - 0.5px), #b8dcc4 calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px)),
    linear-gradient(to bottom, transparent calc(66.666% - 0.5px), #f0b3b3 calc(66.666% - 0.5px), #f0b3b3 calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)),
    linear-gradient(to bottom, transparent calc(100% - 1px), #b8dcc4 calc(100% - 1px), #b8dcc4 100%);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}
.word-line.six-columns {
  grid-template-columns: repeat(6, 1fr);
}
.word-line.seven-columns {
  grid-template-columns: repeat(7, 1fr);
}
.word-line.six-columns .trace-word,
.word-line.seven-columns .trace-word {
  font-size: 18px;
}
.word-line.four-columns,
.alphabet-line.four-columns {
  grid-template-columns: repeat(4, 1fr);
}
.trace-word,
.paragraph-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  padding: 0 1mm;
  color: #cbd0d6;
  font-family: Monaco, Consolas, "Courier New", monospace;
  font-size: 22px;
  line-height: 1.55;
  letter-spacing: 0;
  white-space: nowrap;
}
.trace-word + .trace-word {
  border-left: 1px dashed #cfd3da;
}
.trace-word:last-child {
  border-right: 1px dashed #cfd3da;
}
.trace-word.sample {
  justify-content: flex-start;
  padding-left: 4mm;
  color: #000;
}
.trace-word.faded {
  color: #cbd0d6;
}
.trace-word.blank {
  color: transparent;
}
.row-note {
  height: 7mm;
  padding-left: 5mm;
  color: #999;
  font-size: 16px;
  line-height: 7mm;
}
.alphabet-sheet,
.word-sheet {
  padding-top: 4mm;
}
.alphabet-sheet {
  padding-top: 0;
}
.alphabet-practice-row {
  margin-bottom: 6.2mm;
}
.alphabet-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12mm;
}
.alphabet-column {
  min-width: 0;
}
.alphabet-line {
  width: 100%;
}
.alphabet-line .trace-word {
  padding-left: 1mm;
}
.alphabet-line .trace-word.sample {
  padding-left: 3.2mm;
}
.paragraph-sheet {
  padding-top: 9mm;
}
.paragraph-sheet h3,
.paragraph-sheet h4 {
  margin: 0;
  color: #000;
  text-align: center;
  font-family: ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0;
}
.paragraph-sheet h3 {
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
}
.paragraph-sheet h4 {
  margin-top: 7mm;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.paragraph-copy-area {
  margin-top: 15mm;
}
.paragraph-line {
  height: 10mm;
  margin-bottom: 5mm;
  background-image:
    linear-gradient(to bottom, #b8dcc4 0, #b8dcc4 1px, transparent 1px),
    linear-gradient(to bottom, transparent calc(33.333% - 0.5px), #b8dcc4 calc(33.333% - 0.5px), #b8dcc4 calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px)),
    linear-gradient(to bottom, transparent calc(66.666% - 0.5px), #f0b3b3 calc(66.666% - 0.5px), #f0b3b3 calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)),
    linear-gradient(to bottom, transparent calc(100% - 1px), #b8dcc4 calc(100% - 1px), #b8dcc4 100%);
}
.paragraph-copy {
  justify-content: flex-start;
  width: 100%;
  padding-left: 0;
  color: #cbd0d6;
  font-size: 22px;
  overflow: hidden;
}
.empty-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120mm;
  color: #8c8c8c;
  font-size: 16px;
}

@media (max-width: 768px) {
  .english-container {
    width: 100%;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-width: 0;
    overflow-y: auto;
    padding-bottom: 12px;
  }

  .settings-panel {
    width: 100%;
    flex-shrink: 0;
    overflow: visible;
  }

  .settings-panel :deep(.ant-card-head) {
    min-height: 44px;
    padding: 0 16px;
  }

  .settings-panel :deep(.ant-card-body) {
    padding: 16px;
  }

  .preview-panel {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 430px;
    padding: 12px;
    overflow: auto;
    justify-content: center;
    align-items: flex-start;
  }

  .paper-stack {
    justify-items: center;
  }

  .paper-container {
    flex: 0 0 auto;
    zoom: 0.43;
    border-radius: 6px;
  }

  .paper-info {
    gap: 8px 16px;
    flex-wrap: wrap;
  }
}

@media (min-width: 430px) and (max-width: 768px) {
  .paper-container {
    zoom: 0.5;
  }
}

@media (min-width: 560px) and (max-width: 768px) {
  .paper-container {
    zoom: 0.65;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .english-container {
    display: block;
    gap: 0;
  }
  .print-full-width {
    padding: 0 !important;
    background: transparent !important;
    display: block;
  }
  .paper-container {
    zoom: 1 !important;
    box-shadow: none !important;
    width: 210mm !important;
    height: 297mm !important;
    padding: 15mm !important;
    margin: 0 auto;
  }
  .english-line,
  .reference-line,
  .paragraph-line,
  .alphabet-line {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    forced-color-adjust: none !important;
  }
  .english-line svg,
  .english-line line {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    forced-color-adjust: none !important;
  }
}
</style>
