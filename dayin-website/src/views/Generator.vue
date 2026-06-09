<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
import {
  generateBasicAddition,
  generateBasicSubtraction,
  generateClockReading,
  generateCurrencyUnitConversion,
  generateLengthUnitConversion,
  generateMixedArithmetic,
  generateMoneyExchange,
  generateTableDivision,
  generateTableMultiplication,
  generateTimeUnitConversion,
  generateTripleAddition,
  generateTripleSubtraction,
  generateWeightUnitConversion
} from '../utils/generators/basicMath';
import { generateBreakTen, generateMakeTen } from '../utils/generators/splitMath';
import BasicEquation from '../components/math/BasicEquation.vue';
import ClockEquation from '../components/math/ClockEquation.vue';
import MakeTenEquation from '../components/math/MakeTenEquation.vue';
import SplitTreeEquation from '../components/math/SplitTreeEquation.vue';
import type { MathProblem } from '../types/math';
import { getPdfSourceElement, printElement } from '../utils/print';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const formState = ref({
  type: 'addition',
  maxNumber: 20,
  columns: 3,
  rows: 16,
  showAnswer: false,
  moneyExchangeUnitMode: 'yuan-jiao-fen' as 'yuan' | 'yuan-jiao' | 'yuan-jiao-fen',
});

const problemTypeLabels: Record<string, string> = {
  addition: '基础加法练习题',
  subtraction: '基础减法练习题',
  'break-ten': '破十法练习题',
  'make-ten': '凑十法练习题',
  mixed: '加减混合运算练习题',
  'triple-addition': '三个数连续加法练习题',
  'triple-subtraction': '三个数连续减法练习题',
  'table-division': '表内除法练习题',
  'table-multiplication': '表内乘法练习题',
  'currency-unit': '元角分单位换算练习题',
  'money-exchange': '纸币面值兑换练习题',
  'weight-unit': '质量单位换算练习题',
  'length-unit': '长度单位换算练习题',
  'time-unit': '时间单位换算练习题',
  'clock-reading': '认识钟表练习题',
};

const paperTitle = computed(() => problemTypeLabels[formState.value.type] ?? '口算练习题');

const fixedLayoutTypes = new Set(['break-ten', 'make-ten']);
const clockColumns = 3;
const clockRows = Math.floor((214 + 7) / (48 + 7));
const numberRangeTypes = new Set(['addition', 'subtraction', 'mixed', 'triple-addition', 'triple-subtraction']);
const unitConversionTypes = new Set(['currency-unit', 'weight-unit', 'length-unit', 'time-unit']);
const hiddenLayoutTypes = new Set(['money-exchange']);
const singleColumnTypes = new Set(['money-exchange']);
const clockLayoutTypes = new Set(['clock-reading']);
const threeColumnArithmeticTypes = new Set([
  'addition',
  'subtraction',
  'mixed',
  'triple-addition',
  'triple-subtraction',
  'table-multiplication',
  'table-division',
  'currency-unit',
  'weight-unit',
  'length-unit',
  'time-unit',
]);
const isFixedLayout = computed(() => fixedLayoutTypes.has(formState.value.type));
const isThreeColumnArithmetic = computed(() => threeColumnArithmeticTypes.has(formState.value.type));
const showNumberRange = computed(() => numberRangeTypes.has(formState.value.type));
const showLayoutSettings = computed(() => !hiddenLayoutTypes.has(formState.value.type));
const columns = computed(() => {
  if (singleColumnTypes.has(formState.value.type)) return 1;
  if (clockLayoutTypes.has(formState.value.type)) return clockColumns;
  if (isThreeColumnArithmetic.value) return 3;
  return isFixedLayout.value ? 3 : formState.value.columns;
});
const rows = computed(() => {
  if (singleColumnTypes.has(formState.value.type)) return 12;
  if (clockLayoutTypes.has(formState.value.type)) return clockRows;
  return isFixedLayout.value ? 5 : formState.value.rows;
});
const numberRangeMin = computed(() => formState.value.type === 'triple-subtraction' ? 20 : 10);
const numberRangeMax = computed(() => {
  if (formState.value.type === 'triple-addition') return 100;
  if (formState.value.type === 'triple-subtraction') return 999;
  return 100;
});
const problemCount = computed(() => columns.value * rows.value);
const contentClass = computed(() => ({
  'paper-content': true,
  'make-ten-content': formState.value.type === 'make-ten',
  'split-tree-content': formState.value.type === 'break-ten',
  'basic-content': !isFixedLayout.value,
  'unit-conversion-content': unitConversionTypes.has(formState.value.type),
  'money-exchange-content': formState.value.type === 'money-exchange',
  'clock-content': formState.value.type === 'clock-reading',
}));

watch(
  () => formState.value.type,
  (type) => {
    if (type === 'triple-addition' || type === 'triple-subtraction') {
      formState.value.maxNumber = 50;
      return;
    }

    if (formState.value.maxNumber < numberRangeMin.value) {
      formState.value.maxNumber = numberRangeMin.value;
    } else if (formState.value.maxNumber > numberRangeMax.value) {
      formState.value.maxNumber = numberRangeMax.value;
    }
  }
);

// Generate problems using the new engines
const problemList = computed<MathProblem[]>(() => {
  const config = {
    maxNumber: formState.value.maxNumber,
    count: problemCount.value,
    moneyExchangeUnitMode: formState.value.moneyExchangeUnitMode,
  };
  
  if (formState.value.type === 'addition') {
    return generateBasicAddition(config);
  } else if (formState.value.type === 'subtraction') {
    return generateBasicSubtraction(config);
  } else if (formState.value.type === 'break-ten') {
    return generateBreakTen(config);
  } else if (formState.value.type === 'make-ten') {
    return generateMakeTen(config);
  } else if (formState.value.type === 'mixed') {
    return generateMixedArithmetic(config);
  } else if (formState.value.type === 'triple-addition') {
    return generateTripleAddition(config);
  } else if (formState.value.type === 'triple-subtraction') {
    return generateTripleSubtraction(config);
  } else if (formState.value.type === 'table-division') {
    return generateTableDivision(config);
  } else if (formState.value.type === 'table-multiplication') {
    return generateTableMultiplication(config);
  } else if (formState.value.type === 'currency-unit') {
    return generateCurrencyUnitConversion(config);
  } else if (formState.value.type === 'money-exchange') {
    return generateMoneyExchange(config);
  } else if (formState.value.type === 'weight-unit') {
    return generateWeightUnitConversion(config);
  } else if (formState.value.type === 'length-unit') {
    return generateLengthUnitConversion(config);
  } else if (formState.value.type === 'time-unit') {
    return generateTimeUnitConversion(config);
  } else if (formState.value.type === 'clock-reading') {
    return generateClockReading(config);
  }
  return [];
});
const generatedCount = computed(() => problemList.value.length);
const countLabel = computed(() => {
  if (generatedCount.value === problemCount.value) {
    return `共 ${generatedCount.value} 题`;
  }
  return `最多可生成 ${generatedCount.value} 题（目标 ${problemCount.value} 题）`;
});

const printPaper = () => {
  printElement('printable-paper', paperTitle.value);
};

const downloadPDF = () => {
  const element = document.getElementById('printable-paper');
  if (!element) return;
  const sourceElement = getPdfSourceElement(element);
  
  const opt = {
    margin:       0, // Changed to 0 so it doesn't add extra height
    filename:     `${paperTitle.value}.pdf`,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, windowWidth: 794 }, // 794px is roughly 210mm at 96dpi
    jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };
  
  html2pdf().set(opt).from(sourceElement).save();
};
</script>

<template>
  <div class="generator-container">
    <a-card class="settings-panel no-print" :bordered="false" title="生成设置">
      <a-form layout="vertical" :model="formState">
        <a-form-item label="题型">
          <a-select v-model:value="formState.type">
            <a-select-option value="addition">基础加法</a-select-option>
            <a-select-option value="subtraction">基础减法</a-select-option>
            <a-select-option value="break-ten">破十法练习 (减法)</a-select-option>
            <a-select-option value="make-ten">凑十法练习 (加法)</a-select-option>
            <a-select-option value="mixed">加减混合运算</a-select-option>
            <a-select-option value="triple-addition">三个数连续加法</a-select-option>
            <a-select-option value="triple-subtraction">三个数连续减法</a-select-option>
            <a-select-option value="table-division">表内除法</a-select-option>
            <a-select-option value="table-multiplication">表内乘法</a-select-option>
            <a-select-option value="currency-unit">元角分单位换算</a-select-option>
            <a-select-option value="money-exchange">纸币面值兑换</a-select-option>
            <a-select-option value="weight-unit">质量单位换算</a-select-option>
            <a-select-option value="length-unit">长度单位换算</a-select-option>
            <a-select-option value="time-unit">时间单位换算</a-select-option>
            <a-select-option value="clock-reading">认识钟表</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="showNumberRange" label="数字范围">
          <a-input-number
            v-model:value="formState.maxNumber"
            :min="numberRangeMin"
            :max="numberRangeMax"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item v-if="formState.type === 'money-exchange'" label="金额格式">
          <a-radio-group v-model:value="formState.moneyExchangeUnitMode" button-style="solid">
            <a-radio-button value="yuan">元</a-radio-button>
            <a-radio-button value="yuan-jiao">元角</a-radio-button>
            <a-radio-button value="yuan-jiao-fen">元角分</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="showLayoutSettings" label="排版格式">
          <a-tag v-if="isFixedLayout" color="blue">固定 3列 × 5行 ({{ countLabel }})</a-tag>
          <a-tag v-else-if="formState.type === 'clock-reading'" color="blue">A4 自适应 3列 × {{ rows }}行 ({{ countLabel }})</a-tag>
          <div v-else-if="isThreeColumnArithmetic" class="layout-controls arithmetic-layout-controls">
            <a-input-number v-model:value="formState.rows" :min="1" :max="16" addon-before="行" />
            <a-tag color="blue">固定 3列 × {{ rows }}行 ({{ countLabel }})</a-tag>
          </div>
          <div v-else class="layout-controls">
            <a-input-number v-model:value="formState.columns" :min="1" :max="5" addon-before="列" />
            <a-input-number v-model:value="formState.rows" :min="1" :max="16" addon-before="行" />
            <a-tag color="blue">{{ countLabel }}</a-tag>
          </div>
        </a-form-item>
        <a-form-item label="显示答案">
          <a-switch v-model:checked="formState.showAnswer" />
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
      <div class="paper-container" id="printable-paper">
        <div class="paper-header">
          <h2>{{ paperTitle }}</h2>
          <div class="paper-info">
            <span>姓名：__________</span>
            <span>班级：__________</span>
            <span>日期：__________</span>
            <span>得分：__________</span>
          </div>
        </div>
        <div :class="contentClass" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
          <template v-for="item in problemList" :key="item.id">
            <BasicEquation 
              v-if="item.type === 'basic'" 
              :problem="item" 
              :showAnswer="formState.showAnswer" 
            />
            <SplitTreeEquation 
              v-else-if="item.type === 'split-tree'" 
              :problem="item" 
              :showAnswer="formState.showAnswer" 
            />
            <MakeTenEquation
              v-else-if="item.type === 'make-ten'"
              :problem="item"
              :showAnswer="formState.showAnswer"
            />
            <ClockEquation
              v-else-if="item.type === 'clock'"
              :problem="item"
              :showAnswer="formState.showAnswer"
            />
          </template>
        </div>
        <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generator-container {
  display: flex;
  gap: 24px;
  height: 100%;
}
.settings-panel {
  width: 320px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(60, 54, 38, 0.08);
  overflow-y: auto;
  background: #fffdf7;
}
.preview-panel {
  flex-grow: 1;
  background: #eee8dc;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
}
.paper-container {
  width: 210mm;
  height: 296mm;
  box-sizing: border-box; /* This ensures padding doesn't add to the total width/height */
  background: white;
  padding: 15mm;
  box-shadow: 0 18px 44px rgba(60, 54, 38, 0.16);
  border-radius: 4px;
}
.paper-header h2 {
  text-align: center;
  font-size: 24px;
  font-family: "Kaiti", "STKaiti", serif;
  line-height: 1.2;
  margin: 0 0 6mm;
}
.paper-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8mm;
  font-size: 14px;
  line-height: 1.3;
}
.paper-content {
  display: grid;
  grid-auto-flow: row;
  gap: 24px 10px;
}
.layout-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.layout-controls .ant-tag {
  grid-column: 1 / -1;
  width: max-content;
}
.arithmetic-layout-controls {
  grid-template-columns: 1fr;
}
.basic-content {
  min-height: 238mm;
  grid-auto-rows: minmax(0, 1fr);
  justify-items: stretch;
  align-items: center;
  row-gap: 0;
  column-gap: 10mm;
}
.split-tree-content {
  row-gap: 22px;
}
.make-ten-content {
  min-height: 214mm;
  grid-auto-rows: 1fr;
  align-items: center;
  row-gap: 0;
}
.money-exchange-content {
  min-height: 202mm;
  grid-auto-rows: minmax(0, 1fr);
  align-items: center;
  row-gap: 12px;
}
.clock-content {
  min-height: 214mm;
  grid-auto-rows: minmax(0, 48mm);
  align-items: center;
  row-gap: 7mm;
  column-gap: 8mm;
}

@media (max-width: 768px) {
  .generator-container {
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

  .layout-controls {
    grid-template-columns: 1fr;
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
  .generator-container {
    display: block;
    gap: 0;
  }
  .print-full-width {
    padding: 0 !important;
    background: transparent !important;
    display: block;
    overflow: visible !important;
    border-radius: 0 !important;
  }
  .paper-container {
    zoom: 1 !important;
    box-shadow: none !important;
    width: 210mm !important;
    height: 296mm !important;
    min-height: 0 !important;
    padding: 15mm !important;
    margin: 0 auto;
    overflow: hidden !important;
    break-after: auto;
    page-break-after: avoid; /* Prevent browser from adding a blank page */
  }
}
</style>
