<script setup lang="ts">
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const paperTitle = '英语作业纸';
const englishLineRows = Array.from({ length: 18 }, (_, index) => index + 1);

const printPaper = () => {
  window.print();
};

const downloadPDF = () => {
  const element = document.getElementById('english-printable-paper');
  if (!element) return;
  element.classList.add('exporting');

  const opt = {
    margin: 0,
    filename: `${paperTitle}.pdf`,
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
          <a-select :value="'english-paper'">
            <a-select-option value="english-paper">英语作业纸</a-select-option>
          </a-select>
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
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="english-sheet">
            <div v-for="row in englishLineRows" :key="row" class="english-line">
              <svg viewBox="0 0 180 9" preserveAspectRatio="none" aria-hidden="true">
                <line x1="0" y1="0.25" x2="180" y2="0.25" stroke="#b8dcc4" stroke-width="0.35" />
                <line x1="0" y1="3" x2="180" y2="3" stroke="#b8dcc4" stroke-width="0.35" />
                <line x1="0" y1="6" x2="180" y2="6" stroke="#f0b3b3" stroke-width="0.35" />
                <line x1="0" y1="8.75" x2="180" y2="8.75" stroke="#b8dcc4" stroke-width="0.35" />
              </svg>
            </div>
          </div>
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
  .english-line {
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
