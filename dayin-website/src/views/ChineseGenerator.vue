<script setup lang="ts">
import { computed, ref } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type ChinesePaperType =
  | 'tianzi'
  | 'pinyin-finals'
  | 'pinyin-initials'
  | 'pinyin-syllables'
  | 'stroke-order'
  | 'four-line-square'
  | 'pinyin-paper'
  | 'composition'
  | 'cornell-note';
type StrokeCellMode = 'blank' | 'sample' | 'trace';
type StrokeCell = {
  char: string;
  mode: StrokeCellMode;
};

const finals = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'];
const initials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const syllables = ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'];

const formState = ref({
  type: 'tianzi' as ChinesePaperType,
  strokeChars: '一二三上口日田目',
});

const paperTitles: Record<ChinesePaperType, string> = {
  tianzi: '田字格作业纸',
  'pinyin-finals': '汉语拼音描红字帖（韵母）',
  'pinyin-initials': '汉语拼音描红字帖（声母）',
  'pinyin-syllables': '汉语拼音描红字帖（整体认读）',
  'stroke-order': '按笔顺描红',
  'four-line-square': '四线方格作业纸',
  'pinyin-paper': '拼音作业纸',
  composition: '作文纸',
  'cornell-note': '康奈尔笔记纸（A4）',
};

const paperTitle = computed(() => paperTitles[formState.value.type]);
const isTianzi = computed(() => formState.value.type === 'tianzi');
const isStrokeOrder = computed(() => formState.value.type === 'stroke-order');
const isFourLineSquare = computed(() => formState.value.type === 'four-line-square');
const isPinyinPaper = computed(() => formState.value.type === 'pinyin-paper');
const isComposition = computed(() => formState.value.type === 'composition');
const isCornellNote = computed(() => formState.value.type === 'cornell-note');
const isPairedPinyin = computed(() => formState.value.type === 'pinyin-finals' || formState.value.type === 'pinyin-initials');
const pinyinRows = computed(() => {
  if (formState.value.type === 'pinyin-finals') return finals;
  if (formState.value.type === 'pinyin-initials') return initials;
  if (formState.value.type === 'pinyin-syllables') return syllables;
  return [];
});
const pinyinPracticeRows = computed(() => {
  if (!isPairedPinyin.value) return pinyinRows.value.map((item) => [item]);

  const rows: string[][] = [];
  for (let i = 0; i < pinyinRows.value.length; i += 2) {
    rows.push(pinyinRows.value.slice(i, i + 2));
  }
  return rows;
});
const pinyinPages = computed(() => {
  const pageSize = isPairedPinyin.value ? 12 : 16;
  const pages: string[][][] = [];
  for (let i = 0; i < pinyinPracticeRows.value.length; i += pageSize) {
    pages.push(pinyinPracticeRows.value.slice(i, i + pageSize));
  }
  return pages;
});
const strokeOrderChars = computed(() => (
  formState.value.strokeChars
    .replace(/\s/g, '')
    .split('')
    .filter(Boolean)
    .slice(0, 16)
));
const limitStrokeChars = (value: string) => value.replace(/\s/g, '').slice(0, 16);
const updateStrokeChars = (value: string) => {
  formState.value.strokeChars = limitStrokeChars(value);
};
const buildStrokeCells = (char?: string): StrokeCell[] => {
  if (!char) {
    return Array.from({ length: 15 }, () => ({ char: '', mode: 'blank' }));
  }

  const cells: StrokeCell[] = [{ char, mode: 'sample' }];

  while (cells.length < 8) {
    cells.push({ char, mode: 'trace' });
  }
  while (cells.length < 15) {
    cells.push({ char: '', mode: 'blank' });
  }

  return cells;
};
const strokeRows = computed(() => {
  const rows = strokeOrderChars.value.map((char) => buildStrokeCells(char));
  while (rows.length < 16) {
    rows.push(buildStrokeCells());
  }
  return rows;
});

const printPaper = () => {
  window.print();
};

const downloadPDF = () => {
  const element = document.getElementById('chinese-printable-paper');
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
  <div class="chinese-container">
    <a-card class="settings-panel no-print" :bordered="false" title="生成设置">
      <a-form layout="vertical" :model="formState">
        <a-form-item label="题型">
          <a-select v-model:value="formState.type">
            <a-select-option value="tianzi">田字格作业纸</a-select-option>
            <a-select-option value="four-line-square">四线方格作业纸</a-select-option>
            <a-select-option value="pinyin-paper">拼音作业纸</a-select-option>
            <a-select-option value="composition">作文纸</a-select-option>
            <a-select-option value="cornell-note">康奈尔笔记纸（A4）</a-select-option>
            <a-select-option value="pinyin-finals">汉语拼音描红字帖（韵母）</a-select-option>
            <a-select-option value="pinyin-initials">汉语拼音描红字帖（声母）</a-select-option>
            <a-select-option value="pinyin-syllables">汉语拼音描红字帖（整体认读）</a-select-option>
            <a-select-option value="stroke-order">按笔顺描红</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="isStrokeOrder" label="练习汉字">
          <a-textarea
            :value="formState.strokeChars"
            :maxlength="16"
            :rows="3"
            placeholder="最多输入 16 个汉字"
            show-count
            @update:value="updateStrokeChars"
          />
          <div class="input-tip">最多可输入 16 个字，复制粘贴会自动截取前 16 个字。</div>
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
      <div class="paper-stack" id="chinese-printable-paper">
        <div v-if="isTianzi" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="tianzi-sheet">
            <div v-for="row in 16" :key="row" class="tianzi-row">
              <span v-for="cell in 15" :key="cell" class="tianzi-cell"></span>
            </div>
          </div>
        </div>

        <div v-else-if="isStrokeOrder" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="stroke-sheet">
            <div v-for="(row, rowIndex) in strokeRows" :key="rowIndex" class="stroke-row">
              <span
                v-for="(cell, cellIndex) in row"
                :key="cellIndex"
                class="stroke-cell"
              >
                <span
                  v-if="cell.mode === 'sample'"
                  class="stroke-char sample"
                >
                  {{ cell.char }}
                </span>
                <span
                  v-else-if="cell.mode === 'trace'"
                  class="stroke-char trace"
                >
                  {{ cell.char }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="isFourLineSquare" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="four-line-square-sheet">
            <div v-for="row in 12" :key="row" class="four-line-square-row">
              <div class="practice-line four-line-band">
              </div>
              <div class="square-band">
                <span v-for="cell in 15" :key="cell" class="square-cell"></span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isPinyinPaper" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="pinyin-paper-sheet">
            <div v-for="row in 19" :key="row" class="practice-line pinyin-paper-line">
            </div>
          </div>
        </div>

        <div v-else-if="isComposition" class="paper-container composition-paper">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="composition-title-line">题目：________________________________________</div>
          <div class="composition-grid">
            <span v-for="cell in 500" :key="cell" class="composition-cell"></span>
          </div>
        </div>

        <div v-else-if="isCornellNote" class="paper-container cornell-paper">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>主题：____________________</span>
            </div>
          </div>

          <div class="cornell-sheet">
            <div class="cornell-main">
              <div class="cornell-cues">
                <div class="cornell-label">线索</div>
                <span v-for="line in 22" :key="line" class="cornell-line"></span>
              </div>
              <div class="cornell-notes">
                <div class="cornell-label">笔记</div>
                <span v-for="line in 22" :key="line" class="cornell-line"></span>
              </div>
            </div>
            <div class="cornell-summary">
              <div class="cornell-label">总结</div>
              <span v-for="line in 5" :key="line" class="cornell-line"></span>
            </div>
          </div>
        </div>

        <div v-for="(page, pageIndex) in pinyinPages" v-else :key="pageIndex" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div :class="['pinyin-sheet', { paired: isPairedPinyin }]">
            <div v-for="row in page" :key="row.join('-')" class="pinyin-row">
              <div v-for="item in row" :key="item" class="pinyin-practice">
                <div class="pinyin-line">
                  <span
                    v-for="line in 6"
                    :key="`divider-${line}`"
                    class="pinyin-divider"
                    :style="{ left: `${(line / 7) * 100}%` }"
                  ></span>
                  <span
                    v-for="copy in 7"
                    :key="copy"
                    :class="['pinyin-text', { trace: copy > 1 && copy <= 4, blank: copy > 4 }]"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chinese-container {
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
.paper-stack.exporting .paper-container:not(:last-child) {
  break-after: page;
  page-break-after: always;
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
.input-tip {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}
.tianzi-sheet {
  display: grid;
  gap: 3.2mm;
  padding-top: 2mm;
}
.tianzi-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  width: 180mm;
  height: 12mm;
}
.tianzi-cell {
  position: relative;
  box-sizing: border-box;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.tianzi-cell:first-child {
  border-left: 1px solid #333;
}
.tianzi-cell::before,
.tianzi-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.tianzi-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.tianzi-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.pinyin-sheet {
  display: grid;
  gap: 6.4mm;
}
.pinyin-sheet:not(.paired) {
  gap: 3.8mm;
}
.pinyin-row {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
}
.pinyin-sheet.paired .pinyin-row {
  grid-template-columns: 1fr 1fr;
  column-gap: 11mm;
}
.pinyin-practice {
  min-width: 0;
}
.pinyin-sheet.paired .pinyin-practice {
  min-width: 0;
}
.pinyin-line {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
  height: 10.5mm;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}
.pinyin-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 33.333%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-line::after {
  content: "";
  position: absolute;
  left: 0;
  top: 66.666%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-divider {
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-text {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Edu NSW ACT Foundation", "Kaiti", "STKaiti", serif;
  font-size: 28px;
  line-height: 1;
  color: #333;
  transform: translateY(-3px);
}
.pinyin-text.trace {
  color: rgba(40, 40, 40, 0.18);
}
.pinyin-text.blank {
  visibility: hidden;
}
.stroke-sheet {
  display: grid;
  gap: 3.2mm;
  padding-top: 2mm;
}
.stroke-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  justify-content: center;
}
.stroke-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 12mm;
  height: 12mm;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.stroke-cell:first-child {
  border-left: 1px solid #333;
}
.stroke-cell::before,
.stroke-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.stroke-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.stroke-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.stroke-char {
  position: relative;
  z-index: 1;
  font-family: "Kaiti", "STKaiti", serif;
  font-size: 28px;
  line-height: 1;
  color: #111;
}
.stroke-char.trace {
  color: rgba(100, 110, 125, 0.2);
}
.four-line-square-sheet {
  display: grid;
  gap: 2.55mm;
  padding-top: 1mm;
}
.four-line-square-row {
  display: grid;
  width: 180mm;
  height: 17mm;
  grid-template-rows: 6.5mm 10.5mm;
}
.practice-line {
  position: relative;
  box-sizing: border-box;
  width: 180mm;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}
.practice-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 33.333%;
  width: 100%;
  border-top: 1px dashed #999;
  pointer-events: none;
}
.practice-line::after {
  content: "";
  position: absolute;
  left: 0;
  top: 66.666%;
  width: 100%;
  border-top: 1px dashed #999;
  pointer-events: none;
}
.four-line-band {
  height: 6.5mm;
}
.practice-divider {
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
  pointer-events: none;
}
.square-band {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  width: 180mm;
  height: 10.5mm;
}
.square-cell {
  position: relative;
  box-sizing: border-box;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.square-cell:first-child {
  border-left: 1px solid #333;
}
.square-cell::before,
.square-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.square-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.square-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.pinyin-paper-sheet {
  display: grid;
  gap: 3.5mm;
  padding-top: 2mm;
}
.pinyin-paper-line {
  height: 8.6mm;
}
.composition-paper .paper-info {
  margin-bottom: 14px;
}
.composition-title-line {
  width: 180mm;
  margin-bottom: 5mm;
  font-family: "Kaiti", "STKaiti", serif;
  font-size: 18px;
  line-height: 10mm;
}
.composition-grid {
  display: grid;
  grid-template-columns: repeat(20, 9mm);
  grid-template-rows: repeat(25, 9mm);
  width: 180mm;
  height: 225mm;
}
.composition-cell {
  box-sizing: border-box;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.composition-cell:nth-child(-n + 20) {
  border-top: 1px solid #333;
}
.composition-cell:nth-child(20n + 1) {
  border-left: 1px solid #333;
}
.cornell-paper .paper-info {
  margin-bottom: 14px;
}
.cornell-sheet {
  width: 180mm;
  height: 225mm;
  border: 1px solid #333;
  box-sizing: border-box;
}
.cornell-main {
  display: grid;
  grid-template-columns: 45mm 1fr;
  height: 178mm;
  border-bottom: 1px solid #333;
}
.cornell-cues,
.cornell-notes,
.cornell-summary {
  position: relative;
  box-sizing: border-box;
  padding: 7mm 5mm 4mm;
}
.cornell-cues {
  border-right: 1px solid #333;
}
.cornell-label {
  height: 8mm;
  color: #333;
  font-size: 15px;
  font-family: "Kaiti", "STKaiti", serif;
  line-height: 8mm;
}
.cornell-line {
  display: block;
  height: 7mm;
  border-bottom: 1px solid #999;
}
.cornell-summary {
  height: 47mm;
  padding-top: 4mm;
  padding-bottom: 4mm;
}
.cornell-summary .cornell-label {
  height: 6.5mm;
  line-height: 6.5mm;
}
.cornell-summary .cornell-line {
  height: 6.4mm;
}

@media (max-width: 768px) {
  .chinese-container {
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
    gap: 12px;
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
  .chinese-container {
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
  .paper-container:not(:last-child) {
    break-after: page;
    page-break-after: always;
  }
}
</style>
