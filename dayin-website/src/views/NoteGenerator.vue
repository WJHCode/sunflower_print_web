<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  DownloadOutlined, 
  PrinterOutlined
} from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '../utils/print';
import { useI18n } from '@/i18n';

const { t } = useI18n();

const formState = ref({
  templateType: 'meal-planner' as 'meal-planner' | 'cornell-notes' | 'todo-list' | 'weekly-planner' | 'dot-grid' | 'hex-grid' | 'college-ruled' | 'study-planner',
  theme: 'sage-green' as 'sage-green' | 'nordic-blue' | 'warm-sand' | 'peach-cream' | 'classic-white',
  
  // Meal Planner settings
  mealTitle: 'Meal Planner',
  shoppingTitle: 'Shopping List',
  startDay: 'monday' as 'monday' | 'sunday',
  dayLanguage: 'english' as 'english' | 'chinese',
  meals: 'Breakfast, Lunch, Dinner',
  showDottedLine: true,
  
  // Cornell Notes settings
  cornellTitle: 'NOTES',
  cornellGrid: 'rules' as 'none' | 'rules' | 'grid' | 'dots',
  cornellSpacing: 8, // mm
  
  // To-Do List settings
  todoTitle: 'TO-DO LIST',
  showPriority: true,
  showHabits: true,
  showNotes: true,
  
  // Weekly Planner settings
  weeklyTitle: 'WEEKLY PLANNER',
  weeklyGoals: true,

  // Dot Grid settings
  dotTitle: 'NOTES',
  dotSpacing: 5, // mm
  dotSize: 1.2, // px
  showDotHeader: false,
  dotPureWhite: true,
  dotColorType: 'blue' as 'theme' | 'blue' | 'grey' | 'dark',

  // Hex Grid settings
  hexTitle: 'NOTES',
  hexSpacing: 5, // mm
  hexLineSize: 0.3, // px
  showHexHeader: false,
  hexPureWhite: true,
  hexColorType: 'blue' as 'theme' | 'blue' | 'grey' | 'dark',

  // Ruled Paper (College Ruled) settings
  ruledTitle: 'NOTES',
  ruledSpacing: 7.1, // mm
  ruledMarginLeft: 32, // mm
  ruledLineSize: 0.5, // px
  showRuledHeader: false,
  ruledPureWhite: true,
  ruledColorType: 'blue' as 'theme' | 'blue' | 'grey' | 'dark',
  ruledMarginColorType: 'red' as 'red' | 'theme' | 'blue' | 'grey' | 'dark',
  showRuledMarginLine: true,

  // Study Planner settings
  studyTitle: 'Study Session Planner',
  studyDateLabel: 'Date:',
  studyBeforeStarting: `Gather study materials
Find a quiet, well-lit place to study
Turn off distractions
Clean and organize your space
Turn on background music
Have snacks and water
Set clear goals`,
  studyRewardTitle: 'MY REWARD',
});

const themeStyles = computed(() => {
  const themes: Record<string, { bg: string; headerBg: string; title: string; cardBg: string; text: string; line: string }> = {
    'sage-green': {
      bg: '#d6dfc9',
      headerBg: '#b09f90',
      title: '#5e4d3f',
      cardBg: '#ffffff',
      text: '#5e4d3f',
      line: 'rgba(94, 77, 63, 0.14)'
    },
    'nordic-blue': {
      bg: '#d6e4eb',
      headerBg: '#9eb2c0',
      title: '#3d4e5c',
      cardBg: '#ffffff',
      text: '#3d4e5c',
      line: 'rgba(61, 78, 92, 0.14)'
    },
    'warm-sand': {
      bg: '#eae1d0',
      headerBg: '#c4b19e',
      title: '#6b5847',
      cardBg: '#ffffff',
      text: '#6b5847',
      line: 'rgba(107, 88, 71, 0.14)'
    },
    'peach-cream': {
      bg: '#ebdcd5',
      headerBg: '#c7a49a',
      title: '#634942',
      cardBg: '#ffffff',
      text: '#634942',
      line: 'rgba(99, 73, 66, 0.14)'
    },
    'classic-white': {
      bg: '#ffffff',
      headerBg: '#7d7d7d',
      title: '#2c3b2b',
      cardBg: '#ffffff',
      text: '#2c3b2b',
      line: 'rgba(44, 59, 43, 0.18)'
    }
  };
  return themes[formState.value.theme] || themes['sage-green'];
});

const templateTypeLabels: Record<string, string> = {
  'meal-planner': '周餐计划模板',
  'cornell-notes': '康奈尔笔记模板',
  'todo-list': '待办清单模板',
  'weekly-planner': '周计划模板',
  'dot-grid': '点阵笔记模板',
  'hex-grid': '六边形网格模板',
  'college-ruled': '学院规则模板',
  'study-planner': '学习计划模板'
};

const studyBeforeStartingItems = computed(() => {
  return formState.value.studyBeforeStarting
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
});

const paperTitle = computed(() => templateTypeLabels[formState.value.templateType] ?? '笔记模板');

// List of weekday badges
const weekdayList = computed(() => {
  const isEnglish = formState.value.dayLanguage === 'english';
  if (formState.value.startDay === 'monday') {
    return isEnglish 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      : ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  } else {
    return isEnglish 
      ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  }
});

// Meal labels from comma separated config
const mealLabels = computed(() => {
  return formState.value.meals
    .split(/[,，\s]+/)
    .map(m => m.trim())
    .filter(Boolean);
});

const dotColor = computed(() => {
  if (formState.value.dotColorType === 'blue') return '#a5c0d0'; // Light blue
  if (formState.value.dotColorType === 'grey') return '#d0d0d0'; // Light grey
  if (formState.value.dotColorType === 'dark') return '#505050'; // Charcoal
  return themeStyles.value.line;
});

const hexColor = computed(() => {
  if (formState.value.hexColorType === 'blue') return '#a5c0d0'; // Light blue
  if (formState.value.hexColorType === 'grey') return '#d0d0d0'; // Light grey
  if (formState.value.hexColorType === 'dark') return '#505050'; // Charcoal
  return themeStyles.value.line;
});

const ruledLineColor = computed(() => {
  if (formState.value.ruledColorType === 'blue') return '#a5c0d0'; // Light blue
  if (formState.value.ruledColorType === 'grey') return '#d0d0d0'; // Light grey
  if (formState.value.ruledColorType === 'dark') return '#505050'; // Charcoal
  return themeStyles.value.line;
});

const ruledMarginColor = computed(() => {
  if (formState.value.ruledMarginColorType === 'red') return '#ff4d4f'; // Red
  if (formState.value.ruledMarginColorType === 'blue') return '#a5c0d0'; // Light blue
  if (formState.value.ruledMarginColorType === 'grey') return '#d0d0d0'; // Light grey
  if (formState.value.ruledMarginColorType === 'dark') return '#505050'; // Charcoal
  return themeStyles.value.line;
});

const hexPatternParams = computed(() => {
  const s = formState.value.hexSpacing; // side length (unitless number, represents mm)
  const w = 1.7320508 * s;
  const h = 3 * s;
  
  return {
    w: w + 'mm',
    h: h + 'mm',
    viewBox: `0 0 ${w} ${h}`,
    
    // Points
    p1: `0,0 0,${0.5*s} ${w/2},${s} ${w/2},${2*s} 0,${2.5*s} 0,${3*s}`,
    p2: `${w},0 ${w},${0.5*s} ${w/2},${s}`,
    p3: `${w},${3*s} ${w},${2.5*s} ${w/2},${2*s}`
  };
});

const printPaper = () => {
  printElement('printable-paper', paperTitle.value);
};

const downloadPDF = () => {
  const element = document.getElementById('printable-paper');
  if (!element) return;
  void savePdfFromElement(element, `${paperTitle.value}.pdf`);
};

const downloadImage = () => {
  const element = document.getElementById('printable-paper');
  if (!element) return;
  void saveImageFromElement(element, `${paperTitle.value}.png`);
};
</script>

<template>
  <div class="generator-container">
    <!-- Settings Panel -->
    <a-card class="settings-panel no-print" :bordered="false" :title="t('common.settings')">
      <a-form layout="vertical" :model="formState">
        <a-form-item :label="t('generatorSettings.templateType')">
          <a-select v-model:value="formState.templateType">
            <a-select-option value="meal-planner">{{ t('options.mealPlanner') }}</a-select-option>
            <a-select-option value="cornell-notes">{{ t('options.cornellNotes') }}</a-select-option>
            <a-select-option value="todo-list">{{ t('options.todoList') }}</a-select-option>
            <a-select-option value="weekly-planner">{{ t('options.weeklyPlanner') }}</a-select-option>
            <a-select-option value="dot-grid">{{ t('options.dotGrid') }}</a-select-option>
            <a-select-option value="hex-grid">{{ t('options.hexGrid') }}</a-select-option>
            <a-select-option value="college-ruled">{{ t('options.collegeRuled') }}</a-select-option>
            <a-select-option value="study-planner">{{ t('options.studyPlanner') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.theme')">
          <a-select v-model:value="formState.theme">
            <a-select-option value="sage-green">{{ t('options.sageGreen') }}</a-select-option>
            <a-select-option value="nordic-blue">{{ t('options.nordicBlue') }}</a-select-option>
            <a-select-option value="warm-sand">{{ t('options.warmSand') }}</a-select-option>
            <a-select-option value="peach-cream">{{ t('options.peachCream') }}</a-select-option>
            <a-select-option value="classic-white">{{ t('options.classicWhite') }}</a-select-option>
          </a-select>
        </a-form-item>

        <!-- Template specific settings: Meal Planner -->
        <template v-if="formState.templateType === 'meal-planner'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('common.title')">
            <a-input v-model:value="formState.mealTitle" placeholder="Meal Planner" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.shoppingTitle')">
            <a-input v-model:value="formState.shoppingTitle" placeholder="Shopping List" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.dayLanguage')">
            <a-radio-group v-model:value="formState.dayLanguage" option-type="button" button-style="solid">
              <a-radio-button value="english">{{ t('options.english') }}</a-radio-button>
              <a-radio-button value="chinese">{{ t('options.chinese') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.startDay')">
            <a-radio-group v-model:value="formState.startDay" option-type="button" button-style="solid">
              <a-radio-button value="monday">{{ t('options.monday') }}</a-radio-button>
              <a-radio-button value="sunday">{{ t('options.sunday') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.mealCategories')">
            <a-input v-model:value="formState.meals" placeholder="Breakfast, Lunch, Dinner" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showDottedLine')">
            <a-switch v-model:checked="formState.showDottedLine" />
          </a-form-item>
        </template>

        <!-- Template specific settings: Cornell Notes -->
        <template v-if="formState.templateType === 'cornell-notes'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('common.title')">
            <a-input v-model:value="formState.cornellTitle" placeholder="NOTES" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.backgroundPattern')">
            <a-radio-group v-model:value="formState.cornellGrid" option-type="button" button-style="solid">
              <a-radio-button value="none">{{ t('options.blank') }}</a-radio-button>
              <a-radio-button value="rules">{{ t('options.rules') }}</a-radio-button>
              <a-radio-button value="grid">{{ t('options.grid') }}</a-radio-button>
              <a-radio-button value="dots">{{ t('options.dots') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.gridSpacing')">
            <a-input-number v-model:value="formState.cornellSpacing" :min="5" :max="12" style="width: 100%" />
          </a-form-item>
        </template>

        <!-- Template specific settings: To-Do List -->
        <template v-if="formState.templateType === 'todo-list'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('common.title')">
            <a-input v-model:value="formState.todoTitle" placeholder="TO-DO LIST" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showPriority')">
            <a-switch v-model:checked="formState.showPriority" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showHabits')">
            <a-switch v-model:checked="formState.showHabits" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showNotes')">
            <a-switch v-model:checked="formState.showNotes" />
          </a-form-item>
        </template>

        <!-- Template specific settings: Weekly Planner -->
        <template v-if="formState.templateType === 'weekly-planner'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('common.title')">
            <a-input v-model:value="formState.weeklyTitle" placeholder="WEEKLY PLANNER" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showWeeklyGoals')">
            <a-switch v-model:checked="formState.weeklyGoals" />
          </a-form-item>
        </template>

        <!-- Template specific settings: Dot Grid -->
        <template v-if="formState.templateType === 'dot-grid'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('generatorSettings.paperBackground')">
            <a-radio-group v-model:value="formState.dotPureWhite" option-type="button" button-style="solid">
              <a-radio-button :value="true">{{ t('options.pureWhite') }}</a-radio-button>
              <a-radio-button :value="false">{{ t('options.themeColor') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.dotColor')">
            <a-radio-group v-model:value="formState.dotColorType" option-type="button" button-style="solid">
              <a-radio-button value="theme">{{ t('options.themeColor') }}</a-radio-button>
              <a-radio-button value="blue">{{ t('options.lightBlue') }}</a-radio-button>
              <a-radio-button value="grey">{{ t('options.lightGrey') }}</a-radio-button>
              <a-radio-button value="dark">{{ t('options.charcoal') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showHeader')">
            <a-switch v-model:checked="formState.showDotHeader" />
          </a-form-item>
          <a-form-item v-if="formState.showDotHeader" :label="t('generatorSettings.headerTitle')">
            <a-input v-model:value="formState.dotTitle" placeholder="NOTES" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.dotSpacing')">
            <a-input-number v-model:value="formState.dotSpacing" :min="3" :max="15" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.dotSize')">
            <a-input-number v-model:value="formState.dotSize" :min="0.5" :max="3" :step="0.1" style="width: 100%" />
          </a-form-item>
        </template>

        <!-- Template specific settings: Hex Grid -->
        <template v-if="formState.templateType === 'hex-grid'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('generatorSettings.paperBackground')">
            <a-radio-group v-model:value="formState.hexPureWhite" option-type="button" button-style="solid">
              <a-radio-button :value="true">{{ t('options.pureWhite') }}</a-radio-button>
              <a-radio-button :value="false">{{ t('options.themeColor') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.gridColor')">
            <a-radio-group v-model:value="formState.hexColorType" option-type="button" button-style="solid">
              <a-radio-button value="theme">{{ t('options.themeColor') }}</a-radio-button>
              <a-radio-button value="blue">{{ t('options.lightBlue') }}</a-radio-button>
              <a-radio-button value="grey">{{ t('options.lightGrey') }}</a-radio-button>
              <a-radio-button value="dark">{{ t('options.charcoal') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showHeader')">
            <a-switch v-model:checked="formState.showHexHeader" />
          </a-form-item>
          <a-form-item v-if="formState.showHexHeader" :label="t('generatorSettings.headerTitle')">
            <a-input v-model:value="formState.hexTitle" placeholder="NOTES" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.hexSpacing')">
            <a-input-number v-model:value="formState.hexSpacing" :min="3" :max="15" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.lineSize')">
            <a-input-number v-model:value="formState.hexLineSize" :min="0.1" :max="3" :step="0.1" style="width: 100%" />
          </a-form-item>
        </template>

        <!-- Template specific settings: College Ruled -->
        <template v-if="formState.templateType === 'college-ruled'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('generatorSettings.paperBackground')">
            <a-radio-group v-model:value="formState.ruledPureWhite" option-type="button" button-style="solid">
              <a-radio-button :value="true">{{ t('options.pureWhite') }}</a-radio-button>
              <a-radio-button :value="false">{{ t('options.themeColor') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.ruledColor')">
            <a-radio-group v-model:value="formState.ruledColorType" option-type="button" button-style="solid">
              <a-radio-button value="theme">{{ t('options.themeColor') }}</a-radio-button>
              <a-radio-button value="blue">{{ t('options.lightBlue') }}</a-radio-button>
              <a-radio-button value="grey">{{ t('options.lightGrey') }}</a-radio-button>
              <a-radio-button value="dark">{{ t('options.charcoal') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="t('generatorSettings.ruledSpacing')">
            <a-input-number v-model:value="formState.ruledSpacing" :min="4" :max="15" :step="0.1" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.ruledLineSize')">
            <a-input-number v-model:value="formState.ruledLineSize" :min="0.1" :max="3" :step="0.1" style="width: 100%" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.showMarginLine')">
            <a-switch v-model:checked="formState.showRuledMarginLine" />
          </a-form-item>
          <template v-if="formState.showRuledMarginLine">
            <a-form-item :label="t('generatorSettings.marginPosition')">
              <a-input-number v-model:value="formState.ruledMarginLeft" :min="15" :max="60" :step="1" style="width: 100%" />
            </a-form-item>
            <a-form-item :label="t('generatorSettings.marginColor')">
              <a-radio-group v-model:value="formState.ruledMarginColorType" option-type="button" button-style="solid">
                <a-radio-button value="red">{{ t('options.red') }}</a-radio-button>
                <a-radio-button value="theme">{{ t('options.themeColor') }}</a-radio-button>
                <a-radio-button value="blue">{{ t('options.lightBlue') }}</a-radio-button>
                <a-radio-button value="grey">{{ t('options.lightGrey') }}</a-radio-button>
                <a-radio-button value="dark">{{ t('options.charcoal') }}</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </template>
          <a-form-item :label="t('generatorSettings.showHeader')">
            <a-switch v-model:checked="formState.showRuledHeader" />
          </a-form-item>
          <a-form-item v-if="formState.showRuledHeader" :label="t('generatorSettings.headerTitle')">
            <a-input v-model:value="formState.ruledTitle" placeholder="NOTES" />
          </a-form-item>
        </template>

        <!-- Template specific settings: Study Planner -->
        <template v-if="formState.templateType === 'study-planner'">
          <a-divider style="margin: 12px 0" />
          <a-form-item :label="t('common.mainTitle')">
            <a-input v-model:value="formState.studyTitle" placeholder="Study Session Planner" />
          </a-form-item>
          <a-form-item :label="t('generatorSettings.beforeStarting')">
            <a-textarea v-model:value="formState.studyBeforeStarting" :rows="7" :placeholder="t('generatorSettings.beforeStartingPlaceholder')" />
          </a-form-item>
        </template>

        <a-divider />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper">
            <template #icon><PrinterOutlined /></template>
            {{ t('common.print') }}
          </a-button>
          <div class="export-buttons">
            <a-button block size="large" @click="downloadPDF">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadPdf') }}
            </a-button>
            <a-button block size="large" @click="downloadImage">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadImage') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- Preview Panel -->
    <div class="preview-panel print-full-width">
      <div 
        class="paper-container" 
        id="printable-paper" 
        :style="{
          '--theme-bg': (formState.templateType === 'dot-grid' && formState.dotPureWhite) || (formState.templateType === 'hex-grid' && formState.hexPureWhite) || (formState.templateType === 'college-ruled' && formState.ruledPureWhite) ? '#ffffff' : themeStyles.bg,
          '--theme-header-bg': themeStyles.headerBg,
          '--theme-title-color': themeStyles.title,
          '--theme-card-bg': themeStyles.cardBg,
          '--theme-text-color': themeStyles.text,
          '--theme-line-color': formState.templateType === 'dot-grid' ? dotColor : (formState.templateType === 'hex-grid' ? hexColor : (formState.templateType === 'college-ruled' ? ruledLineColor : themeStyles.line)),
        }"
      >
        <!-- 1. MEAL PLANNER TEMPLATE -->
        <div v-if="formState.templateType === 'meal-planner'" class="meal-planner-view">
          <div class="meal-title-container">
            <div class="title-decor-line"></div>
            <h2 class="meal-title">{{ formState.mealTitle }}</h2>
            <div class="title-decor-line"></div>
          </div>
          
          <div class="meal-content-grid">
            <!-- Left Column: Days -->
            <div class="meal-days-column">
              <div v-for="(day, idx) in weekdayList" :key="day" class="meal-day-wrapper">
                <div class="meal-day-box">
                  <div class="meal-day-badge">{{ day }}</div>
                  <div class="meal-day-card">
                    <div v-for="meal in mealLabels" :key="meal" class="meal-row">
                      <span class="meal-label">{{ meal }} :</span>
                    </div>
                  </div>
                </div>
                <!-- Dotted Line Divider after Thursday/index 3 -->
                <div v-if="formState.showDottedLine && idx === 3" class="meal-dotted-line"></div>
              </div>
            </div>

            <!-- Right Column: Shopping List -->
            <div class="meal-shopping-column">
              <div class="meal-shopping-box">
                <div class="meal-shopping-badge">{{ formState.shoppingTitle }}</div>
                <div class="meal-shopping-card">
                  <svg width="100%" height="100%" style="display: block;">
                    <defs>
                      <pattern id="shopping-lines" width="100%" height="8.5mm" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="8.5mm" x2="100%" y2="8.5mm" :stroke="themeStyles.line" stroke-width="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#shopping-lines)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. CORNELL NOTES TEMPLATE -->
        <div v-else-if="formState.templateType === 'cornell-notes'" class="cornell-notes-view">
          <div class="cornell-header">
            <h2 class="cornell-title">{{ formState.cornellTitle }}</h2>
            <div class="cornell-meta-info">
              <div class="meta-item"><span>Topic / 主题:</span><div class="meta-line"></div></div>
              <div class="meta-item"><span>Date / 日期:</span><div class="meta-line"></div></div>
              <div class="meta-item"><span>Subject / 科目:</span><div class="meta-line"></div></div>
            </div>
          </div>

          <div class="cornell-body">
            <!-- Left cue column -->
            <div class="cornell-cues-panel">
              <div class="panel-label">Cues & Questions / 提问线索</div>
              <div class="panel-content cue-lines-container">
                <svg width="100%" height="100%" style="display: block;">
                  <defs>
                    <pattern id="cue-lines" width="100%" height="9mm" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="9mm" x2="100%" y2="9mm" :stroke="themeStyles.line" stroke-width="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cue-lines)" />
                </svg>
              </div>
            </div>
 
            <!-- Right notes column -->
            <div class="cornell-notes-panel">
              <div class="panel-label">Notes & Details / 笔记记录</div>
              <div class="panel-content texture-container">
                <svg width="100%" height="100%" style="display: block;">
                  <defs>
                    <pattern id="cornell-rules" width="100%" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                      <line x1="0" :y1="formState.cornellSpacing + 'mm'" x2="100%" :y2="formState.cornellSpacing + 'mm'" :stroke="themeStyles.line" stroke-width="1" />
                    </pattern>
                    <pattern id="cornell-grid" :width="formState.cornellSpacing + 'mm'" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                      <rect width="100%" height="100%" fill="none" :stroke="themeStyles.line" stroke-width="1" />
                    </pattern>
                    <pattern id="cornell-dots" :width="formState.cornellSpacing + 'mm'" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                      <circle :cx="(formState.cornellSpacing/2) + 'mm'" :cy="(formState.cornellSpacing/2) + 'mm'" r="1" :fill="themeStyles.line" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" :fill="formState.cornellGrid === 'rules' ? 'url(#cornell-rules)' : (formState.cornellGrid === 'grid' ? 'url(#cornell-grid)' : (formState.cornellGrid === 'dots' ? 'url(#cornell-dots)' : 'none'))" />
                </svg>
              </div>
            </div>
          </div>
 
          <!-- Bottom summary -->
          <div class="cornell-summary">
            <div class="panel-label">Summary / 总结归纳</div>
            <div class="panel-content texture-container">
              <svg width="100%" height="100%" style="display: block;">
                <defs>
                  <pattern id="summary-rules" width="100%" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                    <line x1="0" :y1="formState.cornellSpacing + 'mm'" x2="100%" :y2="formState.cornellSpacing + 'mm'" :stroke="themeStyles.line" stroke-width="1" />
                  </pattern>
                  <pattern id="summary-grid" :width="formState.cornellSpacing + 'mm'" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                    <rect width="100%" height="100%" fill="none" :stroke="themeStyles.line" stroke-width="1" />
                  </pattern>
                  <pattern id="summary-dots" :width="formState.cornellSpacing + 'mm'" :height="formState.cornellSpacing + 'mm'" patternUnits="userSpaceOnUse">
                    <circle :cx="(formState.cornellSpacing/2) + 'mm'" :cy="(formState.cornellSpacing/2) + 'mm'" r="1" :fill="themeStyles.line" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" :fill="formState.cornellGrid === 'rules' ? 'url(#summary-rules)' : (formState.cornellGrid === 'grid' ? 'url(#summary-grid)' : (formState.cornellGrid === 'dots' ? 'url(#summary-dots)' : 'none'))" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 3. TO-DO LIST TEMPLATE -->
        <div v-else-if="formState.templateType === 'todo-list'" class="todo-list-view">
          <div class="todo-header">
            <h2 class="todo-title">{{ formState.todoTitle }}</h2>
            <div class="todo-date-field">
              <span>Date:</span><div class="todo-date-line"></div>
            </div>
          </div>

          <div class="todo-body-grid">
            <div class="todo-left-column">
              <!-- Priorities -->
              <div v-if="formState.showPriority" class="todo-box priority-box">
                <div class="todo-box-title">Top Priorities / 重心任务</div>
                <div class="todo-box-body">
                  <div v-for="i in 3" :key="i" class="todo-item-row">
                    <div class="todo-circle-num"><span>{{ i }}</span></div>
                    <div class="todo-item-line"></div>
                  </div>
                </div>
              </div>

              <!-- Tasks -->
              <div class="todo-box tasks-box">
                <div class="todo-box-title">To-Do List / 任务清单</div>
                <div class="todo-box-body">
                  <div v-for="i in 11" :key="i" class="todo-item-row">
                    <div class="todo-checkbox"></div>
                    <div class="todo-item-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="todo-right-column">
              <!-- Habit Tracker -->
              <div v-if="formState.showHabits" class="todo-box habit-box">
                <div class="todo-box-title">Habit Tracker / 习惯打卡</div>
                <div class="todo-box-body">
                  <div class="habit-header-row">
                    <span class="habit-name-lbl">Habit</span>
                    <div class="habit-days-lbl">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                  </div>
                  <div v-for="i in 5" :key="i" class="habit-item-row">
                    <div class="habit-name-line"></div>
                    <div class="habit-circles">
                      <div v-for="d in 7" :key="d" class="habit-day-circle"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="formState.showNotes" class="todo-box notes-box">
                <div class="todo-box-title">Notes & Doodles / 随手记</div>
                <div class="todo-box-body notes-grid-container">
                  <svg width="100%" height="100%" style="display: block;">
                    <defs>
                      <pattern id="todo-dots" width="8mm" height="8mm" patternUnits="userSpaceOnUse">
                        <circle cx="4mm" cy="4mm" r="0.8" :fill="themeStyles.line" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#todo-dots)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. WEEKLY PLANNER TEMPLATE -->
        <div v-else-if="formState.templateType === 'weekly-planner'" class="weekly-view">
          <div class="weekly-header">
            <h2 class="weekly-title">{{ formState.weeklyTitle }}</h2>
            <div class="weekly-meta-info">
              <div class="weekly-meta-item"><span>Week of:</span><div class="weekly-meta-line"></div></div>
            </div>
          </div>

          <div class="weekly-body-grid">
            <!-- Left Days -->
            <div class="weekly-days">
              <div 
                v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']" 
                :key="day" 
                class="weekly-day-item"
              >
                <div class="weekly-day-title">{{ day }}</div>
                <div class="weekly-day-card">
                  <div class="weekly-card-line"></div>
                  <div class="weekly-card-line"></div>
                  <div class="weekly-card-line"></div>
                </div>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="weekly-sidebar">
              <!-- Goals -->
              <div v-if="formState.weeklyGoals" class="weekly-side-box goals-box">
                <div class="weekly-side-title">Weekly Goals / 本周目标</div>
                <div class="weekly-side-body">
                  <div v-for="i in 4" :key="i" class="goal-item">
                    <div class="goal-dot"></div>
                    <div class="goal-line"></div>
                  </div>
                </div>
              </div>

              <!-- Habits -->
              <div class="weekly-side-box habits-box">
                <div class="weekly-side-title">Habits / 习惯跟踪</div>
                <div class="weekly-side-body">
                  <div class="habit-header-row">
                    <span class="habit-name-lbl">Habit</span>
                    <div class="habit-days-lbl">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                  </div>
                  <div v-for="i in 4" :key="i" class="weekly-habit-row">
                    <div class="weekly-habit-line"></div>
                    <div class="weekly-habit-circles">
                      <div v-for="d in 7" :key="d" class="weekly-habit-dot"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Memo -->
              <div class="weekly-side-box memo-box">
                <div class="weekly-side-title">Memo / 备忘录</div>
                <div class="weekly-side-body memo-dots-container">
                  <svg width="100%" height="100%" style="display: block;">
                    <defs>
                      <pattern id="weekly-dots" width="7mm" height="7mm" patternUnits="userSpaceOnUse">
                        <circle cx="3.5mm" cy="3.5mm" r="0.8" :fill="themeStyles.line" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#weekly-dots)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. DOT GRID TEMPLATE -->
        <div v-else-if="formState.templateType === 'dot-grid'" class="dot-grid-view">
          <div v-if="formState.showDotHeader" class="dot-grid-header">
            <h2 class="dot-grid-title">{{ formState.dotTitle }}</h2>
            <div class="dot-grid-date-field">
              <span>Date:</span><div class="dot-grid-date-line"></div>
            </div>
          </div>
          <div class="dot-grid-content">
            <svg width="100%" height="100%" style="display: block;">
              <defs>
                <pattern id="full-dot-grid" :width="formState.dotSpacing + 'mm'" :height="formState.dotSpacing + 'mm'" patternUnits="userSpaceOnUse">
                  <circle 
                    :cx="(formState.dotSpacing / 2) + 'mm'" 
                    :cy="(formState.dotSpacing / 2) + 'mm'" 
                    :r="(formState.dotSize / 2) + 'px'" 
                    :fill="dotColor" 
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#full-dot-grid)" />
            </svg>
          </div>
        </div>

        <!-- 6. HEX GRID TEMPLATE -->
        <div v-else-if="formState.templateType === 'hex-grid'" class="hex-grid-view">
          <div v-if="formState.showHexHeader" class="hex-grid-header">
            <h2 class="hex-grid-title">{{ formState.hexTitle }}</h2>
            <div class="hex-grid-date-field">
              <span>Date:</span><div class="hex-grid-date-line"></div>
            </div>
          </div>
          <div class="hex-grid-content">
            <svg width="100%" height="100%" style="display: block;">
              <defs>
                <pattern 
                  id="full-hex-grid" 
                  :width="hexPatternParams.w" 
                  :height="hexPatternParams.h" 
                  :viewBox="hexPatternParams.viewBox" 
                  patternUnits="userSpaceOnUse"
                >
                  <polyline :points="hexPatternParams.p1" fill="none" :stroke="hexColor" :stroke-width="formState.hexLineSize" />
                  <polyline :points="hexPatternParams.p2" fill="none" :stroke="hexColor" :stroke-width="formState.hexLineSize" />
                  <polyline :points="hexPatternParams.p3" fill="none" :stroke="hexColor" :stroke-width="formState.hexLineSize" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#full-hex-grid)" />
            </svg>
          </div>
        </div>

        <!-- 7. COLLEGE RULED TEMPLATE -->
        <div v-else-if="formState.templateType === 'college-ruled'" class="college-ruled-view">
          <!-- Absolute SVG for the vertical margin line so it runs full height -->
          <svg v-if="formState.showRuledMarginLine" class="ruled-margin-svg" width="100%" height="100%">
            <line 
              :x1="formState.ruledMarginLeft + 'mm'" 
              y1="0" 
              :x2="formState.ruledMarginLeft + 'mm'" 
              y2="100%" 
              :stroke="ruledMarginColor" 
              stroke-width="1.2" 
            />
          </svg>

          <!-- Main content layout -->
          <div class="college-ruled-container">
            <div v-if="formState.showRuledHeader" class="college-ruled-header">
              <h2 class="college-ruled-title">{{ formState.ruledTitle }}</h2>
              <div class="college-ruled-date-field">
                <span>Date:</span><div class="college-ruled-date-line"></div>
              </div>
            </div>
            <div class="college-ruled-content" :style="{ marginTop: formState.showRuledHeader ? '5mm' : '8mm' }">
              <svg width="100%" height="100%" style="display: block;">
                <defs>
                  <pattern id="full-ruled-lines" width="100%" :height="formState.ruledSpacing + 'mm'" patternUnits="userSpaceOnUse">
                    <line 
                      x1="0" 
                      :y1="formState.ruledSpacing + 'mm'" 
                      x2="100%" 
                      :y2="formState.ruledSpacing + 'mm'" 
                      :stroke="ruledLineColor" 
                      :stroke-width="formState.ruledLineSize" 
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#full-ruled-lines)" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 8. STUDY PLANNER TEMPLATE -->
        <div v-else-if="formState.templateType === 'study-planner'" class="study-planner-view">
          <div class="study-planner-header">
            <h2 class="study-planner-title">{{ formState.studyTitle }}</h2>
            <div class="study-planner-date-field">
              <span>{{ formState.studyDateLabel }}</span>
              <div class="study-planner-date-line"></div>
            </div>
          </div>

          <div class="study-planner-grid">
            <!-- Left Column -->
            <div class="study-left-col">
              <!-- TIME GOAL -->
              <div class="study-section">
                <div class="study-section-title">TIME GOAL</div>
                <div class="study-time-box">
                  <div class="study-time-row border-double">
                    <span class="study-time-label">Start Time:</span>
                    <span class="study-time-label">End Time:</span>
                  </div>
                  <div class="study-time-row">
                    <span class="study-time-label">Total Time:</span>
                  </div>
                </div>
              </div>

              <!-- STUDY GOALS -->
              <div class="study-section">
                <div class="study-section-title">STUDY GOALS</div>
                <div class="study-goals-box">
                  <div v-for="num in ['01', '02', '03', '04']" :key="num" class="study-goal-row">
                    <span class="study-goal-num">{{ num }}</span>
                    <div class="study-goal-line"></div>
                  </div>
                </div>
              </div>

              <!-- TOPICS / CHAPTERS -->
              <div class="study-section flex-grow-section">
                <div class="study-section-title">TOPICS / CHAPTERS</div>
                <div class="study-topics-box">
                  <div v-for="i in 10" :key="i" class="study-topic-row">
                    <div class="study-topic-main"></div>
                    <div class="study-topic-check"></div>
                  </div>
                </div>
              </div>

              <!-- BREAKS -->
              <div class="study-section">
                <div class="study-section-title">BREAKS</div>
                <div class="study-breaks-box">
                  <div v-for="i in 4" :key="i" class="study-break-row">
                    <div class="study-break-main"></div>
                    <div class="study-break-check"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="study-right-col">
              <!-- BEFORE STARTING -->
              <div class="study-section">
                <div class="study-section-title">BEFORE STARTING</div>
                <div class="study-before-box">
                  <div v-for="(item, idx) in studyBeforeStartingItems" :key="idx" class="study-before-row">
                    <div class="study-checkbox-square"></div>
                    <span class="study-before-text">{{ item }}</span>
                  </div>
                </div>
              </div>

              <!-- TIME BLOCKING -->
              <div class="study-section">
                <div class="study-section-title">TIME BLOCKING</div>
                <div class="study-timeblock-grid">
                  <div class="study-tb-header">
                    <div class="study-tb-cell header-cell"></div>
                    <div class="study-tb-cell header-cell">15</div>
                    <div class="study-tb-cell header-cell">30</div>
                    <div class="study-tb-cell header-cell">45</div>
                    <div class="study-tb-cell header-cell">60</div>
                  </div>
                  <div v-for="hour in 10" :key="hour" class="study-tb-row">
                    <div class="study-tb-cell hour-label">Hour {{ hour }}</div>
                    <div class="study-tb-cell"></div>
                    <div class="study-tb-cell"></div>
                    <div class="study-tb-cell"></div>
                    <div class="study-tb-cell"></div>
                  </div>
                </div>
              </div>

              <!-- NOTES / MY REWARD -->
              <div class="study-section notes-section">
                <div class="study-section-title">NOTES</div>
                <div class="study-notes-container">
                  <div class="study-notes-box"></div>
                  <div class="study-reward-badge">
                    <svg class="reward-svg" viewBox="0 0 72 72">
                      <path id="reward-curve" d="M 10 36 A 26 26 0 0 1 62 36" fill="none" stroke="none" />
                      <text fill="var(--theme-title-color)" class="reward-text">
                        <textPath href="#reward-curve" startOffset="50%" text-anchor="middle">
                          {{ formState.studyRewardTitle }}
                        </textPath>
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paper Footer (Printed at bottom) -->
        <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Common generator styling */
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

/* A4 Container */
.paper-container {
  width: 210mm;
  height: 296mm;
  box-sizing: border-box;
  background: var(--theme-bg);
  padding: 18mm 15mm 15mm 15mm; /* Extra padding top to center layout */
  box-shadow: 0 18px 44px rgba(60, 54, 38, 0.16);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Color transition logic */
  transition: background 0.25s ease;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* 1. MEAL PLANNER STYLING */
.meal-planner-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.meal-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}
.title-decor-line {
  flex-grow: 1;
  border-top: 1.5px solid var(--theme-title-color);
}
.meal-title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--theme-title-color);
  text-align: center;
  letter-spacing: 1.5px;
}

.meal-content-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 20px;
  flex-grow: 1;
  min-height: 0;
}
.meal-days-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.meal-day-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meal-day-box {
  position: relative;
  padding-top: 10px;
}
.meal-day-badge {
  position: absolute;
  top: 0;
  left: 14px;
  background: var(--theme-header-bg);
  color: #ffffff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11px;
  font-weight: bold;
  padding: 2.5px 14px;
  border-radius: 6px;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}
.meal-day-card {
  background: var(--theme-card-bg);
  border-radius: 6px;
  padding: 16px 16px 8px 16px;
  min-height: 23.5mm;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
.meal-row {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: var(--theme-text-color);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  opacity: 0.85;
  margin-bottom: 2px;
}
.meal-label {
  font-weight: 500;
}
.meal-dotted-line {
  border-bottom: 1.5px dotted var(--theme-header-bg);
  margin: 5px 0;
  opacity: 0.7;
}

.meal-shopping-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.meal-shopping-box {
  position: relative;
  padding-top: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.meal-shopping-badge {
  position: absolute;
  top: 0;
  left: 14px;
  background: var(--theme-header-bg);
  color: #ffffff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11px;
  font-weight: bold;
  padding: 2.5px 14px;
  border-radius: 6px;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}
.meal-shopping-card {
  background: var(--theme-card-bg);
  border-radius: 6px;
  flex-grow: 1;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  position: relative;
  padding: 0;
}
.meal-shopping-card svg {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  height: calc(100% - 20px);
}

/* 2. CORNELL NOTES STYLING */
.cornell-notes-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--theme-text-color);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.cornell-header {
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 12px;
  margin-bottom: 15px;
}
.cornell-title {
  margin: 0 0 12px 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--theme-title-color);
}
.cornell-meta-info {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 15px;
}
.meta-item {
  display: flex;
  align-items: flex-end;
  font-size: 12px;
  color: var(--theme-text-color);
  opacity: 0.85;
}
.meta-item span {
  white-space: nowrap;
  font-weight: 500;
  margin-right: 6px;
}
.meta-line {
  flex-grow: 1;
  border-bottom: 1px solid var(--theme-title-color);
  margin-bottom: 2px;
  opacity: 0.5;
}

.cornell-body {
  display: grid;
  grid-template-columns: 3fr 7fr;
  flex-grow: 1;
  min-height: 0;
  border-bottom: 2px solid var(--theme-title-color);
}
.cornell-cues-panel {
  border-right: 2px solid var(--theme-title-color);
  padding: 10px 12px 10px 0;
  display: flex;
  flex-direction: column;
}
.cornell-notes-panel {
  padding: 10px 0 10px 15px;
  display: flex;
  flex-direction: column;
}
.panel-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--theme-title-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  opacity: 0.8;
}
.panel-content {
  flex-grow: 1;
}

.cue-lines-container,
.texture-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.cue-lines-container svg,
.texture-container svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Cornell Summary */
.cornell-summary {
  height: 50mm;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
}

/* 3. TO-DO LIST STYLING */
.todo-list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--theme-text-color);
}
.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.todo-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1.5px;
  color: var(--theme-title-color);
}
.todo-date-field {
  display: flex;
  align-items: flex-end;
  font-size: 13px;
  font-weight: 500;
  width: 180px;
}
.todo-date-line {
  flex-grow: 1;
  border-bottom: 1.2px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 6px;
  opacity: 0.6;
}

.todo-body-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  flex-grow: 1;
  min-height: 0;
}
.todo-left-column,
.todo-right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.todo-box {
  background: var(--theme-card-bg);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}
.todo-box-title {
  background: var(--theme-header-bg);
  color: #ffffff;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
  border-radius: 6px 6px 0 0;
}
.todo-box-body {
  padding: 15px 12px;
  flex-grow: 1;
}

/* Left panel content */
.priority-box {
  flex-shrink: 0;
}
.tasks-box {
  flex-grow: 1;
}
.todo-item-row {
  display: flex;
  align-items: center;
  margin-bottom: 11.5px;
}
.todo-item-row:last-child {
  margin-bottom: 0;
}
.todo-circle-num {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--theme-title-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: var(--theme-title-color);
  margin-right: 10px;
  flex-shrink: 0;
}
.todo-checkbox {
  width: 15px;
  height: 15px;
  border: 1.5px solid var(--theme-header-bg);
  border-radius: 3px;
  margin-right: 10px;
  flex-shrink: 0;
}
.todo-item-line {
  flex-grow: 1;
  border-bottom: 1px solid var(--theme-line-color);
  height: 12px;
}

/* Right panel content */
.habit-box {
  flex-shrink: 0;
}
.notes-box {
  flex-grow: 1;
}
.habit-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  color: var(--theme-title-color);
  opacity: 0.8;
  margin-bottom: 8px;
  padding: 0 4px;
}
.habit-name-lbl {
  width: 50%;
}
.habit-days-lbl {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
.habit-days-lbl span {
  width: 14px;
  text-align: center;
}
.habit-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 11px;
}
.habit-item-row:last-child {
  margin-bottom: 0;
}
.habit-name-line {
  width: 48%;
  border-bottom: 1px solid var(--theme-line-color);
  height: 14px;
}
.habit-circles {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
.habit-day-circle {
  width: 12px;
  height: 12px;
  border: 1.2px solid var(--theme-header-bg);
  border-radius: 50%;
}
.notes-grid-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
}
.notes-grid-container svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 4. WEEKLY PLANNER STYLING */
.weekly-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--theme-text-color);
}
.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.weekly-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1.5px;
  color: var(--theme-title-color);
}
.weekly-meta-info {
  display: flex;
  align-items: flex-end;
  font-size: 13px;
  width: 180px;
}
.weekly-meta-item {
  display: flex;
  align-items: flex-end;
  width: 100%;
}
.weekly-meta-line {
  flex-grow: 1;
  border-bottom: 1.2px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 6px;
  opacity: 0.6;
}

.weekly-body-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 20px;
  flex-grow: 1;
  min-height: 0;
}
.weekly-days {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.weekly-day-item {
  background: var(--theme-card-bg);
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  height: 29.5mm;
  display: flex;
  flex-direction: column;
}
.weekly-day-title {
  font-family: Georgia, serif;
  font-size: 12px;
  font-weight: bold;
  color: var(--theme-title-color);
  margin-bottom: 4px;
  border-bottom: 1px dashed var(--theme-line-color);
  padding-bottom: 2px;
}
.weekly-day-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-top: 2px;
}
.weekly-card-line {
  border-bottom: 1px solid var(--theme-line-color);
  opacity: 0.8;
  height: 12px;
}

.weekly-sidebar {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.weekly-side-box {
  background: var(--theme-card-bg);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}
.weekly-side-title {
  background: var(--theme-header-bg);
  color: #ffffff;
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: bold;
  letter-spacing: 0.5px;
  border-radius: 6px 6px 0 0;
}
.weekly-side-body {
  padding: 12px;
  flex-grow: 1;
}

/* Goals in weekly */
.goals-box {
  flex-shrink: 0;
}
.goal-item {
  display: flex;
  align-items: center;
  margin-bottom: 9px;
}
.goal-item:last-child {
  margin-bottom: 0;
}
.goal-dot {
  width: 6px;
  height: 6px;
  border: 1.5px solid var(--theme-title-color);
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
.goal-line {
  flex-grow: 1;
  border-bottom: 1px solid var(--theme-line-color);
  height: 10px;
}

/* Habits in weekly */
.habits-box {
  flex-shrink: 0;
}
.weekly-habit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8.5px;
}
.weekly-habit-row:last-child {
  margin-bottom: 0;
}
.weekly-habit-line {
  width: 45%;
  border-bottom: 1px solid var(--theme-line-color);
  height: 12px;
}
.weekly-habit-circles {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
.weekly-habit-dot {
  width: 10px;
  height: 10px;
  border: 1.2px solid var(--theme-header-bg);
  border-radius: 50%;
}

/* Memo in weekly */
.memo-box {
  flex-grow: 1;
  min-height: 50mm;
}
.memo-dots-container {
  height: 100%;
  position: relative;
  width: 100%;
}
.memo-dots-container svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 5. DOT GRID STYLING */
.dot-grid-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--theme-text-color);
}
.dot-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.dot-grid-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1.5px;
  color: var(--theme-title-color);
}
.dot-grid-date-field {
  display: flex;
  align-items: flex-end;
  font-size: 13px;
  font-weight: 500;
  width: 180px;
}
.dot-grid-date-line {
  flex-grow: 1;
  border-bottom: 1.2px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 6px;
  opacity: 0.6;
}
.dot-grid-content {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  position: relative;
}
.dot-grid-content svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 6. HEX GRID STYLING */
.hex-grid-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--theme-text-color);
}
.hex-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.hex-grid-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1.5px;
  color: var(--theme-title-color);
}
.hex-grid-date-field {
  display: flex;
  align-items: flex-end;
  font-size: 13px;
  font-weight: 500;
  width: 180px;
}
.hex-grid-date-line {
  flex-grow: 1;
  border-bottom: 1.2px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 6px;
  opacity: 0.6;
}
.hex-grid-content {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  position: relative;
}
.hex-grid-content svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 7. COLLEGE RULED STYLING */
.college-ruled-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 210mm;
  height: 296mm;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.ruled-margin-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.college-ruled-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 18mm 0mm 15mm 0mm;
  position: relative;
  z-index: 2;
}

.college-ruled-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--theme-title-color);
  padding-bottom: 10px;
  margin-left: 15mm;
  margin-right: 15mm;
  margin-bottom: 10px;
  background: transparent;
}

.college-ruled-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1.5px;
  color: var(--theme-title-color);
}

.college-ruled-date-field {
  display: flex;
  align-items: flex-end;
  font-size: 13px;
  font-weight: 500;
  width: 180px;
}

.college-ruled-date-line {
  flex-grow: 1;
  border-bottom: 1.2px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 6px;
  opacity: 0.6;
}

.college-ruled-content {
  flex-grow: 1;
  width: 100%;
  position: relative;
}

.college-ruled-content svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}



/* 8. STUDY PLANNER STYLING */
.study-planner-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--theme-text-color);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

/* Header */
.study-planner-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding-bottom: 5px;
  border-bottom: 2px solid var(--theme-title-color);
}

.study-planner-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--theme-title-color);
}

.study-planner-date-field {
  display: flex;
  align-items: flex-end;
  font-size: 12px;
  font-weight: 600;
  color: var(--theme-text-color);
  width: 180px;
}

.study-planner-date-line {
  flex-grow: 1;
  border-bottom: 1.5px solid var(--theme-title-color);
  margin-bottom: 2px;
  margin-left: 8px;
  opacity: 0.6;
}

/* Two-column grid layout */
.study-planner-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 18px;
  flex-grow: 1;
  min-height: 0;
  box-sizing: border-box;
}

.study-left-col,
.study-right-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.study-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.study-section:last-child {
  margin-bottom: 0;
}

.study-section-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--theme-title-color);
  margin-bottom: 5px;
  text-transform: uppercase;
}

/* TIME GOAL */
.study-time-box {
  border-top: 1.5px solid var(--theme-title-color);
  border-bottom: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
}

.study-time-row {
  display: flex;
  padding: 6px 8px;
  font-size: 10px;
  font-weight: 600;
}

.study-time-row.border-double {
  border-bottom: 1px solid var(--theme-line-color);
}

.study-time-label {
  flex: 1;
}

/* STUDY GOALS */
.study-goals-box {
  border-top: 1.5px solid var(--theme-title-color);
  border-bottom: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
}

.study-goal-row {
  display: flex;
  align-items: center;
  height: 8.5mm;
  border-bottom: 1px solid var(--theme-line-color);
}

.study-goal-row:last-child {
  border-bottom: none;
}

.study-goal-num {
  width: 28px;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
  border-right: 1px solid var(--theme-line-color);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-title-color);
}

.study-goal-line {
  flex: 1;
  height: 100%;
}

/* TOPICS / CHAPTERS */
.study-topics-box {
  border-top: 1.5px solid var(--theme-title-color);
  border-bottom: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
}

.study-topic-row {
  display: flex;
  height: 8.2mm;
  border-bottom: 1px solid var(--theme-line-color);
}

.study-topic-row:last-child {
  border-bottom: none;
}

.study-topic-main {
  flex: 1;
  border-right: 1px solid var(--theme-line-color);
}

.study-topic-check {
  width: 32px;
  height: 100%;
}

/* BREAKS */
.study-breaks-box {
  border-top: 1.5px solid var(--theme-title-color);
  border-bottom: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
}

.study-break-row {
  display: flex;
  height: 8.2mm;
  border-bottom: 1px solid var(--theme-line-color);
}

.study-break-row:last-child {
  border-bottom: none;
}

.study-break-main {
  flex: 1;
  border-right: 1px solid var(--theme-line-color);
}

.study-break-check {
  width: 32px;
  height: 100%;
}

/* BEFORE STARTING */
.study-before-box {
  border-top: 1.5px solid var(--theme-title-color);
  border-bottom: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
  padding: 6px 8px;
}

.study-before-row {
  display: flex;
  align-items: center;
  height: 7.2mm;
}

.study-checkbox-square {
  width: 10px;
  height: 10px;
  border: 1px solid var(--theme-title-color);
  margin-right: 10px;
  flex-shrink: 0;
}

.study-before-text {
  font-size: 10px;
  font-weight: 500;
  color: var(--theme-text-color);
}

/* TIME BLOCKING */
.study-timeblock-grid {
  border: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
  display: flex;
  flex-direction: column;
}

.study-tb-header,
.study-tb-row {
  display: flex;
  height: 8mm;
}

.study-tb-header {
  height: 6.5mm;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--theme-line-color);
}

.study-tb-row {
  border-bottom: 1px solid var(--theme-line-color);
}

.study-tb-row:last-child {
  border-bottom: none;
}

.study-tb-cell {
  flex: 1;
  border-right: 1px solid var(--theme-line-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.study-tb-cell:last-child {
  border-right: none;
}

.study-tb-cell.header-cell {
  font-size: 9px;
  font-weight: 800;
  color: var(--theme-title-color);
}

.study-tb-cell.hour-label {
  font-size: 9px;
  font-weight: 800;
  color: var(--theme-title-color);
  justify-content: flex-start;
  padding-left: 6px;
  background: rgba(0, 0, 0, 0.015);
}

/* NOTES & REWARD */
.notes-section {
  flex-grow: 1;
  margin-bottom: 0;
}

.study-notes-container {
  position: relative;
  flex-grow: 1;
  display: flex;
  min-height: 48mm;
}

.study-notes-box {
  width: 100%;
  height: 100%;
  border: 1.5px solid var(--theme-title-color);
  background: var(--theme-card-bg);
  box-sizing: border-box;
}

.study-reward-badge {
  position: absolute;
  top: -24px;
  right: -12px;
  width: 72px;
  height: 72px;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-title-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 0 0 3px var(--theme-card-bg);
}

.reward-svg {
  width: 100%;
  height: 100%;
  position: absolute;
}

.reward-text {
  font-size: 7.5px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-weight: 900;
  letter-spacing: 0.2px;
}

/* Responsive adjustment */
@media (max-width: 768px) {
  .generator-container {
    width: 100%;
    flex-direction: column;
    gap: 12px;
    height: auto;
    min-width: 0;
    overflow: visible;
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
    overflow: hidden;
    justify-content: center;
    align-items: flex-start;
  }

  .paper-container {
    flex: 0 0 auto;
    --zoom-factor: 0.43;
    transform: scale(var(--zoom-factor));
    transform-origin: top left;
    margin-right: calc(-210mm * (1 - var(--zoom-factor)));
    margin-bottom: calc(-296mm * (1 - var(--zoom-factor)));
    border-radius: 6px;
  }
}

@media (min-width: 430px) and (max-width: 768px) {
  .paper-container {
    --zoom-factor: 0.5;
  }
}

@media (min-width: 560px) and (max-width: 768px) {
  .paper-container {
    --zoom-factor: 0.65;
  }
}

/* Print Styles */
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
    transform: none !important;
    zoom: 1 !important;
    box-shadow: none !important;
    width: 210mm !important;
    height: 296mm !important;
    min-height: 0 !important;
    padding: 18mm 15mm 15mm 15mm !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    break-after: auto;
    page-break-after: avoid;
  }
}
</style>
