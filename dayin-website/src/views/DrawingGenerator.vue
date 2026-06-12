<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  DownloadOutlined, 
  PrinterOutlined,
  CheckOutlined
} from '@ant-design/icons-vue';
import { getPdfSourceElement, printElement } from '../utils/print';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface DrawingPath {
  d: string;
  fill?: string;
  alwaysFill?: boolean;
}

interface DrawingItem {
  id: string;
  name: string;
  pinyin: string;
  category: 'boy' | 'girl' | 'animal' | 'magic';
  paths: DrawingPath[];
  isEmpty?: boolean;
}

const DRAWING_TEMPLATES: DrawingItem[] = [
  // Magic Fairy Tale Category
  {
    id: 'fairy',
    name: '魔法仙子',
    pinyin: 'mó fǎ xiān zǐ',
    category: 'magic',
    paths: [
      { d: 'M 50 26 C 45 13 58 13 53 26', fill: '#fde047' },
      { d: 'M 54 22 A 2.5 2.5 0 1 1 53.9 22 Z', fill: '#fca5a5' },
      { d: 'M 50 32 C 41 32 39 40 39 46 C 39 52 45 56 50 56 C 55 56 61 52 61 46 C 61 40 59 32 50 32 Z', fill: '#ffedd5' },
      { d: 'M 38 42 C 38 32 44 26 50 26 C 56 26 62 32 62 42 C 62 48 59 48 59 44 C 55 40 45 40 41 44', fill: '#fde047' },
      { d: 'M 46 44 A 1.8 1.8 0 1 1 45.9 44 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 54 44 A 1.8 1.8 0 1 1 53.9 44 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 48 49 Q 50 52 52 49' },
      { d: 'M 41 47 Q 43 49 43 47', fill: '#ffb3c1', alwaysFill: true },
      { d: 'M 57 47 Q 59 49 59 47', fill: '#ffb3c1', alwaysFill: true },
      { d: 'M 32 44 L 28 60' },
      { d: 'M 32 44 L 30 41 L 27 41 L 29 39 L 28 36 L 32 38 L 36 36 L 35 39 L 37 41 L 34 41 Z', fill: '#fef08a', alwaysFill: true },
      { d: 'M 42 56 L 36 60', fill: '#ffedd5' },
      { d: 'M 58 56 L 66 60', fill: '#ffedd5' },
      { d: 'M 45 56 L 40 74 C 40 76 60 76 60 74 L 55 56 Z', fill: '#86efac' },
      { d: 'M 47 75 L 47 84 C 47 86 51 86 51 84 Z', fill: '#ffedd5' },
      { d: 'M 53 75 L 53 84 C 53 86 57 86 57 84 Z', fill: '#ffedd5' },
      { d: 'M 42 46 C 30 35 22 55 42 56 Z', fill: '#c084fc' },
      { d: 'M 42 56 C 30 65 34 75 42 66 Z', fill: '#c084fc' },
      { d: 'M 58 46 C 70 35 78 55 58 56 Z', fill: '#c084fc' },
      { d: 'M 58 56 C 70 65 66 75 58 66 Z', fill: '#c084fc' }
    ]
  },
  {
    id: 'wings',
    name: '精灵翅膀',
    pinyin: 'jīng líng chì bǎng',
    category: 'magic',
    paths: [
      { d: 'M 50 50 C 25 15 15 45 50 52 Z', fill: '#c084fc' },
      { d: 'M 50 52 C 20 62 25 85 50 64 Z', fill: '#c084fc' },
      { d: 'M 50 50 C 75 15 85 45 50 52 Z', fill: '#c084fc' },
      { d: 'M 50 52 C 80 62 75 85 50 64 Z', fill: '#c084fc' },
      { d: 'M 49 42 C 49 40 51 40 51 42 L 51 68 C 51 70 49 70 49 68 Z', fill: '#ffb3c1' },
      { d: 'M 49 42 Q 45 35 40 37' },
      { d: 'M 51 42 Q 55 35 60 37' },
      { d: 'M 42 45 C 32 30 25 45 42 48 Z', fill: '#e9d5ff' },
      { d: 'M 58 45 C 68 30 75 45 58 48 Z', fill: '#e9d5ff' },
      { d: 'M 38 60 A 2 2 0 1 1 37.9 60 Z', fill: '#fde047', alwaysFill: true },
      { d: 'M 62 60 A 2 2 0 1 1 61.9 60 Z', fill: '#fde047', alwaysFill: true }
    ]
  },
  {
    id: 'mushroom',
    name: '蘑菇屋',
    pinyin: 'mó gu wū',
    category: 'magic',
    paths: [
      { d: 'M 18 50 C 18 20 82 20 82 50 C 82 56 70 58 50 58 C 30 58 18 56 18 50 Z', fill: '#fda4af' },
      { d: 'M 24 38 L 24 28 L 30 28 L 30 34', fill: '#e2e8f0' },
      { d: 'M 35 34 A 4 4 0 1 1 34.9 34 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 65 34 A 5 5 0 1 1 64.9 34 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 50 44 A 4.5 4.5 0 1 1 49.9 44 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 25 45 A 3 3 0 1 1 24.9 45 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 75 45 A 3 3 0 1 1 74.9 45 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 30 58 C 30 78 35 85 50 85 C 65 85 70 78 70 58', fill: '#fef3c7' },
      { d: 'M 43 85 L 43 70 C 43 66 57 66 57 70 L 57 85', fill: '#d8b4fe' },
      { d: 'M 54 78 A 1 1 0 1 1 53.9 78 Z', fill: '#fbbf24', alwaysFill: true },
      { d: 'M 36 68 A 5 5 0 1 1 35.9 68 Z', fill: '#bae6fd' },
      { d: 'M 36 63 L 36 73' },
      { d: 'M 31 68 L 41 68' },
      { d: 'M 40 61 A 1.2 1.2 0 1 1 39.9 61 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 60 61 A 1.2 1.2 0 1 1 59.9 61 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 48 64 Q 50 66 52 64' },
      { d: 'M 22 85 Q 26 78 28 85', fill: '#86efac' },
      { d: 'M 72 85 Q 74 78 78 85', fill: '#86efac' }
    ]
  },
  {
    id: 'flowerdoor',
    name: '花朵门',
    pinyin: 'huā duǒ mén',
    category: 'magic',
    paths: [
      { d: 'M 30 85 C 22 85 18 70 28 65 C 18 60 22 45 32 45 C 28 35 40 25 48 35 C 52 25 64 35 60 45 C 70 45 74 60 64 65 C 74 70 70 85 62 85 Z', fill: '#fbcfe8' },
      { d: 'M 36 85 L 36 60 C 36 50 64 50 64 60 L 64 85', fill: '#fed7aa' },
      { d: 'M 50 53 L 50 85' },
      { d: 'M 58 72 A 1.5 1.5 0 1 1 57.9 72 Z', fill: '#fbbf24', alwaysFill: true },
      { d: 'M 44 63 A 1.2 1.2 0 1 1 43.9 63 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 56 63 A 1.2 1.2 0 1 1 55.9 63 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 48 67 Q 50 69 52 67' },
      { d: 'M 28 85 C 20 80 24 72 32 75 Z', fill: '#86efac' },
      { d: 'M 64 85 C 72 80 68 72 60 75 Z', fill: '#86efac' }
    ]
  },
  {
    id: 'firefly',
    name: '萤火虫',
    pinyin: 'yíng huǒ chóng',
    category: 'magic',
    paths: [
      { d: 'M 50 35 C 44 35 40 39 40 45 C 40 51 44 55 50 55 C 56 55 60 51 60 45 C 60 39 56 35 50 35 Z', fill: '#a7f3d0' },
      { d: 'M 46 35 Q 40 25 35 28' },
      { d: 'M 54 35 Q 60 25 65 28' },
      { d: 'M 34 28 A 1 1 0 1 1 33.9 28 Z', fill: '#fde047', alwaysFill: true },
      { d: 'M 66 28 A 1 1 0 1 1 65.9 28 Z', fill: '#fde047', alwaysFill: true },
      { d: 'M 45 43 A 1.8 1.8 0 1 1 44.9 43 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 55 43 A 1.8 1.8 0 1 1 54.9 43 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 48 48 Q 50 50 52 48' },
      { d: 'M 44 55 C 44 55 35 70 50 80 C 65 70 56 55 56 55 Z', fill: '#fef08a' },
      { d: 'M 50 63 L 50 73' },
      { d: 'M 45 67 L 55 67' },
      { d: 'M 38 80 L 32 85' },
      { d: 'M 50 83 L 50 90' },
      { d: 'M 62 80 L 68 85' },
      { d: 'M 32 70 L 26 72' },
      { d: 'M 68 70 L 74 72' },
      { d: 'M 42 48 C 22 40 26 62 43 53 Z', fill: '#e0f2fe' },
      { d: 'M 58 48 C 78 40 74 62 57 53 Z', fill: '#e0f2fe' },
      { d: 'M 38 48 Q 30 46 34 53', fill: '#bae6fd' },
      { d: 'M 62 48 Q 70 46 66 53', fill: '#bae6fd' }
    ]
  },
  {
    id: 'leafboat',
    name: '树叶船',
    pinyin: 'shù yè chuán',
    category: 'magic',
    paths: [
      { d: 'M 15 65 C 25 80 75 80 85 65 C 75 74 25 74 15 65 Z', fill: '#86efac' },
      { d: 'M 44 71 A 1.2 1.2 0 1 1 43.9 71 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 56 71 A 1.2 1.2 0 1 1 55.9 71 Z', fill: '#1f2937', alwaysFill: true },
      { d: 'M 48 74 Q 50 76 52 74' },
      { d: 'M 50 35 L 50 67' },
      { d: 'M 52 38 L 52 62 C 52 62 68 62 62 50 C 56 38 52 38 52 38 Z', fill: '#fca5a5' },
      { d: 'M 50 35 L 56 32 L 50 29 Z', fill: '#fde047' },
      { d: 'M 10 82 Q 20 79 30 82 T 50 82 T 70 82 T 90 82', fill: '#bae6fd' }
    ]
  },

  // Boys Category
  {
    id: 'ultraman',
    name: '奥特曼',
    pinyin: 'ào tè màn',
    category: 'boy',
    paths: [
      { d: 'M 50 20 C 32 20 28 32 28 46 C 28 60 38 70 50 70 C 62 70 72 60 72 46 C 72 32 68 20 50 20 Z', fill: '#f3f4f6' },
      { d: 'M 47 20 L 47 8 C 47 6 53 6 53 8 L 53 20 Z', fill: '#e5e7eb' },
      { d: 'M 38 46 C 33 46 33 56 38 56 C 43 56 43 46 38 46 Z', fill: '#fde047', alwaysFill: true },
      { d: 'M 62 46 C 57 46 57 56 62 56 C 67 56 67 46 62 46 Z', fill: '#fde047', alwaysFill: true },
      { d: 'M 46 60 Q 50 63 54 60' },
      { d: 'M 28 41 L 24 44 L 28 47', fill: '#e5e7eb' },
      { d: 'M 72 41 L 76 44 L 72 47', fill: '#e5e7eb' },
      { d: 'M 43 70 L 43 78 L 28 85', fill: '#e5e7eb' },
      { d: 'M 57 70 L 57 78 L 72 85', fill: '#e5e7eb' },
      { d: 'M 50 79 L 52 82 L 55 82 L 53 84 L 54 87 L 50 85 L 46 87 L 47 84 L 45 82 L 48 82 Z', fill: '#93c5fd', alwaysFill: true }
    ]
  },
  {
    id: 'airplane',
    name: '飞机',
    pinyin: 'fēi jī',
    category: 'boy',
    paths: [
      { d: 'M 20 48 C 15 48 10 52 10 55 C 10 58 15 62 20 62 L 75 62 C 85 62 90 55 90 55 C 90 55 85 48 75 48 Z', fill: '#93c5fd' },
      { d: 'M 75 48 L 86 28 L 91 28 L 81 48', fill: '#2563eb' },
      { d: 'M 40 48 L 52 20 L 64 20 L 48 48', fill: '#3b82f6' },
      { d: 'M 45 62 L 57 90 L 69 90 L 53 62', fill: '#3b82f6' },
      { d: 'M 28 55 A 2 2 0 1 1 27.99 55', fill: '#e0f2fe', alwaysFill: true },
      { d: 'M 36 55 A 2 2 0 1 1 35.99 55', fill: '#e0f2fe', alwaysFill: true },
      { d: 'M 44 55 A 2 2 0 1 1 43.99 55', fill: '#e0f2fe', alwaysFill: true }
    ]
  },
  {
    id: 'car',
    name: '小汽车',
    pinyin: 'xiǎo qì chē',
    category: 'boy',
    paths: [
      { d: 'M 35 68 A 9 9 0 1 1 34.99 68', fill: '#4b5563', alwaysFill: true },
      { d: 'M 35 73 A 4 4 0 1 1 34.99 73', fill: '#9ca3af', alwaysFill: true },
      { d: 'M 65 68 A 9 9 0 1 1 64.99 68', fill: '#4b5563', alwaysFill: true },
      { d: 'M 65 73 A 4 4 0 1 1 64.99 73', fill: '#9ca3af', alwaysFill: true },
      { d: 'M 12 73 L 26 73 A 9 9 0 0 1 44 73 L 56 73 A 9 9 0 0 1 74 73 L 88 73 C 92 73 92 65 88 65 L 82 65 L 72 42 L 38 42 L 28 65 L 12 65 C 8 65 8 73 12 73 Z', fill: '#fca5a5' },
      { d: 'M 53 42 L 53 65' },
      { d: 'M 32 61 L 41 46 L 50 46 L 50 61 Z', fill: '#e0f2fe' },
      { d: 'M 56 46 L 69 46 L 76 61 L 56 61 Z', fill: '#e0f2fe' },
      { d: 'M 11 68 A 1.5 1.5 0 1 1 10.99 68', fill: '#fef08a', alwaysFill: true }
    ]
  },
  {
    id: 'dinosaur',
    name: '恐龙',
    pinyin: 'kǒng lóng',
    category: 'boy',
    paths: [
      { d: 'M 35 45 C 35 25 55 20 60 35 C 60 40 55 45 50 48 C 53 55 65 58 75 58 C 85 58 90 70 85 73 C 75 75 62 68 55 68 L 52 82 L 44 82 L 46 68 L 38 68 L 36 82 L 28 82 L 32 63 C 28 58 35 50 35 45 Z', fill: '#a7f3d0' },
      { d: 'M 48 30 A 2 2 0 1 1 47.99 30', fill: '#1f2937', alwaysFill: true },
      { d: 'M 45 38 Q 48 40 52 37' },
      { d: 'M 50 21 L 53 17 L 56 22', fill: '#fde047' },
      { d: 'M 58 27 L 62 23 L 64 30', fill: '#fde047' },
      { d: 'M 65 42 L 70 39 L 71 46', fill: '#fde047' },
      { d: 'M 72 55 L 77 53 L 77 58', fill: '#fde047' },
      { d: 'M 38 54 Q 32 54 35 58', fill: '#a7f3d0' },
      { d: 'M 40 56 Q 35 56 37 60', fill: '#a7f3d0' }
    ]
  },
  {
    id: 'sailboat',
    name: '帆船',
    pinyin: 'fān chuán',
    category: 'boy',
    paths: [
      { d: 'M 18 64 L 82 64 L 70 80 L 30 80 Z', fill: '#fdba74' },
      { d: 'M 23 70 L 77 70' },
      { d: 'M 50 20 L 50 64' },
      { d: 'M 52 23 L 52 59 L 75 59 Z', fill: '#fca5a5' },
      { d: 'M 48 25 C 34 38 34 54 48 59 Z', fill: '#93c5fd' },
      { d: 'M 15 84 Q 25 81 35 84 T 55 84 T 75 84 T 85 84', fill: '#e0f2fe' },
      { d: 'M 10 89 Q 20 86 30 89 T 50 89 T 70 89 T 90 89', fill: '#e0f2fe' }
    ]
  },
  {
    id: 'robot',
    name: '机器人',
    pinyin: 'jī qì rén',
    category: 'boy',
    paths: [
      { d: 'M 35 25 L 65 25 A 4 4 0 0 1 69 29 L 69 46 A 4 4 0 0 1 65 50 L 35 50 A 4 4 0 0 1 31 46 L 31 29 A 4 4 0 0 1 35 25 Z', fill: '#e2e8f0' },
      { d: 'M 31 34 L 27 34 L 27 39 L 31 39', fill: '#cbd5e1' },
      { d: 'M 69 34 L 73 34 L 73 39 L 69 39', fill: '#cbd5e1' },
      { d: 'M 50 25 L 50 15' },
      { d: 'M 50 15 A 2.5 2.5 0 1 1 49.99 15', fill: '#fde047', alwaysFill: true },
      { d: 'M 42 35 A 3 3 0 1 1 41.99 35', fill: '#93c5fd', alwaysFill: true },
      { d: 'M 58 35 A 3 3 0 1 1 57.99 35', fill: '#93c5fd', alwaysFill: true },
      { d: 'M 38 44 L 62 44' },
      { d: 'M 44 42 L 44 46' },
      { d: 'M 50 42 L 50 46' },
      { d: 'M 56 42 L 56 46' },
      { d: 'M 46 50 L 46 55 L 54 55 L 54 50', fill: '#cbd5e1' },
      { d: 'M 28 55 L 72 55 A 4 4 0 0 1 76 59 L 76 80 A 4 4 0 0 1 72 84 L 28 84 A 4 4 0 0 1 24 80 L 24 59 A 4 4 0 0 1 28 55 Z', fill: '#e2e8f0' },
      { d: 'M 34 60 L 66 60 L 66 72 L 34 72 Z', fill: '#bae6fd' },
      { d: 'M 38 66 L 44 63 L 50 69 L 56 63 L 62 66' },
      { d: 'M 38 78 A 1.5 1.5 0 1 1 37.99 78', fill: '#ef4444', alwaysFill: true },
      { d: 'M 46 78 A 1.5 1.5 0 1 1 45.99 78', fill: '#ef4444', alwaysFill: true },
      { d: 'M 54 78 A 1.5 1.5 0 1 1 53.99 78', fill: '#ef4444', alwaysFill: true },
      { d: 'M 24 62 L 14 62 L 14 74 L 18 74', fill: '#cbd5e1' },
      { d: 'M 76 62 L 86 62 L 86 74 L 82 74', fill: '#cbd5e1' },
      { d: 'M 38 84 L 38 92 L 46 92', fill: '#cbd5e1' },
      { d: 'M 62 84 L 62 92 L 54 92', fill: '#cbd5e1' }
    ]
  },

  // Girls Category
  {
    id: 'melody',
    name: '美乐蒂',
    pinyin: 'měi lè dì',
    category: 'girl',
    paths: [
      { d: 'M 50 25 C 32 25 28 35 28 50 C 28 65 38 72 50 72 C 62 72 72 65 72 50 C 72 35 68 25 50 25 Z', fill: '#fca5a5' },
      { d: 'M 56 26 C 58 10 70 12 66 28', fill: '#fca5a5' },
      { d: 'M 44 26 C 40 12 28 15 32 25 C 34 29 42 32 40 28', fill: '#fca5a5' },
      { d: 'M 50 40 C 40 40 36 46 36 54 C 36 62 42 66 50 66 C 58 66 64 62 64 54 C 64 46 60 40 50 40 Z', fill: '#fffdf7' },
      { d: 'M 44 52 A 1.5 2 0 1 1 43.99 52', fill: '#1f2937', alwaysFill: true },
      { d: 'M 56 52 A 1.5 2 0 1 1 55.99 52', fill: '#1f2937', alwaysFill: true },
      { d: 'M 50 55 A 1 1.2 0 1 1 49.99 55', fill: '#fbbf24', alwaysFill: true },
      { d: 'M 48 59 Q 50 61 52 59' },
      { d: 'M 45 32 A 3 3 0 1 1 44.99 32', fill: '#fde047', alwaysFill: true },
      { d: 'M 41 29 C 39 24 45 24 43 29 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 47 29 C 49 24 43 24 45 29 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 41 35 C 39 40 45 40 43 35 Z', fill: '#ffffff', alwaysFill: true },
      { d: 'M 47 35 C 49 40 43 40 45 35 Z', fill: '#ffffff', alwaysFill: true }
    ]
  },
  {
    id: 'kuromi',
    name: '库洛米',
    pinyin: 'kù luò mǐ',
    category: 'girl',
    paths: [
      { d: 'M 50 28 C 32 28 28 40 28 55 C 28 70 38 77 50 77 C 62 77 72 70 72 55 C 72 40 68 28 50 28 Z', fill: '#374151' },
      { d: 'M 32 32 L 15 20 C 15 20 22 30 30 38', fill: '#374151' },
      { d: 'M 14 19 A 2.5 2.5 0 1 1 13.99 19', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 68 32 L 85 20 C 85 20 78 30 70 38', fill: '#374151' },
      { d: 'M 86 19 A 2.5 2.5 0 1 1 85.99 19', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 50 42 C 41 42 37 48 37 58 C 37 68 42 71 50 71 C 58 71 63 68 63 58 C 63 48 59 42 50 42 Z', fill: '#fffdf7' },
      { d: 'M 41 53 C 41 50 46 52 45 55 C 44 57 41 55 41 53 Z', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 59 53 C 59 50 54 52 55 55 C 56 57 59 55 59 53 Z', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 39 51 L 37 49' },
      { d: 'M 61 51 L 63 49' },
      { d: 'M 47 62 Q 50 65 53 62' },
      { d: 'M 50 35 A 3 3 0 1 1 49.99 35', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 48.5 35 A 0.5 0.5 0 1 1 48.49 35', fill: '#374151', alwaysFill: true },
      { d: 'M 51.5 35 A 0.5 0.5 0 1 1 51.49 35', fill: '#374151', alwaysFill: true },
      { d: 'M 48 38 L 46 40', fill: '#fbcfe8', alwaysFill: true },
      { d: 'M 52 38 L 54 40', fill: '#fbcfe8', alwaysFill: true }
    ]
  },
  {
    id: 'house',
    name: '小房子',
    pinyin: 'xiǎo fáng zi',
    category: 'girl',
    paths: [
      { d: 'M 20 45 L 50 15 L 80 45 Z', fill: '#fca5a5' },
      { d: 'M 25 45 L 25 85 L 75 85 L 75 45', fill: '#fef3c7' },
      { d: 'M 32 85 L 32 60 L 48 60 L 48 85', fill: '#fdba74' },
      { d: 'M 44 72 A 1.5 1.5 0 1 1 43.99 72', fill: '#fbbf24', alwaysFill: true },
      { d: 'M 54 52 L 54 68 L 70 68 L 70 52 Z', fill: '#bae6fd' },
      { d: 'M 62 52 L 62 68' },
      { d: 'M 54 60 L 70 60' },
      { d: 'M 65 30 L 65 22 L 72 22 L 72 37', fill: '#cbd5e1' },
      { d: 'M 68 18 Q 66 12 70 8' }
    ]
  },
  {
    id: 'princess',
    name: '小公主',
    pinyin: 'xiǎo gōng zhǔ',
    category: 'girl',
    paths: [
      { d: 'M 50 45 C 38 45 36 53 36 60 C 36 68 42 72 50 72 C 58 72 64 68 64 60 C 64 53 62 45 50 45 Z', fill: '#ffedd5' },
      { d: 'M 32 42 A 7 7 0 1 1 31.99 42', fill: '#4b5563' },
      { d: 'M 68 42 A 7 7 0 1 1 67.99 42', fill: '#4b5563' },
      { d: 'M 36 55 C 42 45 46 45 50 52 C 54 45 58 45 64 55 Z', fill: '#4b5563' },
      { d: 'M 44 45 L 42 38 L 50 41 L 58 38 L 56 45 Z', fill: '#fde047' },
      { d: 'M 42 38 A 1 1 0 1 1 41.99 38', fill: '#f87171', alwaysFill: true },
      { d: 'M 50 41 A 1 1 0 1 1 49.99 41', fill: '#f87171', alwaysFill: true },
      { d: 'M 58 38 A 1 1 0 1 1 57.99 38', fill: '#f87171', alwaysFill: true },
      { d: 'M 42 58 A 2 2 0 1 1 41.99 58', fill: '#60a5fa', alwaysFill: true },
      { d: 'M 58 58 A 2 2 0 1 1 57.99 58', fill: '#60a5fa', alwaysFill: true },
      { d: 'M 48 65 Q 50 67 52 65' },
      { d: 'M 47 72 L 47 75', fill: '#ffedd5' },
      { d: 'M 53 72 L 53 75', fill: '#ffedd5' },
      { d: 'M 44 75 Q 50 78 56 75', fill: '#fff' },
      { d: 'M 44 75 L 33 90 L 67 90 L 56 75 Z', fill: '#fbcfe8' },
      { d: 'M 44 75 C 38 73 38 82 42 82', fill: '#fbcfe8' },
      { d: 'M 56 75 C 62 73 62 82 58 82', fill: '#fbcfe8' }
    ]
  },
  {
    id: 'sun',
    name: '小太阳',
    pinyin: 'xiǎo tài yáng',
    category: 'girl',
    paths: [
      { d: 'M 50 30 A 20 20 0 1 1 49.99 30', fill: '#fca5a5' },
      { d: 'M 50 10 L 50 22' },
      { d: 'M 50 90 L 50 78' },
      { d: 'M 10 50 L 22 50' },
      { d: 'M 90 50 L 78 50' },
      { d: 'M 22 22 L 31 31' },
      { d: 'M 78 22 L 69 31' },
      { d: 'M 22 78 L 31 69' },
      { d: 'M 78 78 L 69 69' },
      { d: 'M 43 45 A 2 2 0 1 1 42.99 45', fill: '#1f2937', alwaysFill: true },
      { d: 'M 57 45 A 2 2 0 1 1 56.99 45', fill: '#1f2937', alwaysFill: true },
      { d: 'M 44 55 Q 50 62 56 55' }
    ]
  },
  {
    id: 'moon',
    name: '小月亮',
    pinyin: 'xiǎo yuè liang',
    category: 'girl',
    paths: [
      { d: 'M 35 20 C 51.5 20 65 33.5 65 50 C 65 66.5 51.5 80 35 80 C 47.5 80 57.5 70 57.5 50 C 57.5 30 47.5 20 35 20 Z', fill: '#fde047' },
      { d: 'M 43 45 Q 46 48 49 45' },
      { d: 'M 45 53 Q 48 57 51 52' },
      { d: 'M 72 25 L 74 30 L 79 30 L 75 33 L 77 38 L 72 35 L 67 38 L 69 33 L 65 30 L 70 30 Z', fill: '#fef08a', alwaysFill: true }
    ]
  },
  {
    id: 'star',
    name: '小星星',
    pinyin: 'xiǎo xīng xing',
    category: 'girl',
    paths: [
      { d: 'M 50 12 L 62 38 L 90 38 L 67 54 L 76 80 L 50 64 L 24 80 L 33 54 L 10 38 L 38 38 Z', fill: '#fde047' },
      { d: 'M 42 46 A 2 2 0 1 1 41.99 46', fill: '#1f2937', alwaysFill: true },
      { d: 'M 58 46 A 2 2 0 1 1 57.99 46', fill: '#1f2937', alwaysFill: true },
      { d: 'M 45 54 Q 50 60 55 54' }
    ]
  },
  {
    id: 'tree',
    name: '小树',
    pinyin: 'xiǎo shù',
    category: 'girl',
    paths: [
      { d: 'M 46 72 L 46 90 L 54 90 L 54 72 Z', fill: '#d97706' },
      { d: 'M 50 15 C 35 15 25 25 25 40 C 25 45 28 50 30 53 C 20 58 20 70 30 75 C 35 78 45 75 50 72 C 55 75 65 78 70 75 C 80 70 80 58 70 53 C 72 50 75 45 75 40 C 75 25 65 15 50 15 Z', fill: '#a7f3d0' },
      { d: 'M 50 25 L 50 35' },
      { d: 'M 38 45 L 43 45' },
      { d: 'M 62 45 L 57 45' }
    ]
  },
  {
    id: 'flower',
    name: '小花朵',
    pinyin: 'xiǎo huā duǒ',
    category: 'girl',
    paths: [
      { d: 'M 50 45 A 12 12 0 1 1 49.99 45', fill: '#fde047' },
      { d: 'M 50 23 A 10 10 0 1 1 49.99 23', fill: '#fbcfe8' },
      { d: 'M 71 38 A 10 10 0 1 1 70.99 38', fill: '#fbcfe8' },
      { d: 'M 63 62 A 10 10 0 1 1 62.99 62', fill: '#fbcfe8' },
      { d: 'M 37 62 A 10 10 0 1 1 36.99 62', fill: '#fbcfe8' },
      { d: 'M 29 38 A 10 10 0 1 1 28.99 38', fill: '#fbcfe8' },
      { d: 'M 50 57 L 50 90' },
      { d: 'M 50 75 Q 30 75 50 65', fill: '#a7f3d0' },
      { d: 'M 50 82 Q 70 82 50 72', fill: '#a7f3d0' },
      { d: 'M 45 42 A 1 1 0 1 1 44.99 42', fill: '#1f2937', alwaysFill: true },
      { d: 'M 55 42 A 1 1 0 1 1 54.99 42', fill: '#1f2937', alwaysFill: true },
      { d: 'M 46 48 Q 50 52 54 48' }
    ]
  },

  // Animals Category
  {
    id: 'cat',
    name: '小猫',
    pinyin: 'xiǎo māo',
    category: 'animal',
    paths: [
      { d: 'M 50 25 C 32 25 32 50 50 50 C 68 50 68 25 50 25 Z', fill: '#fef3c7' },
      { d: 'M 35 28 L 28 15 L 42 22', fill: '#fca5a5' },
      { d: 'M 65 28 L 72 15 L 58 22', fill: '#fca5a5' },
      { d: 'M 42 36 A 2.5 2.5 0 1 1 41.99 36', fill: '#1f2937', alwaysFill: true },
      { d: 'M 58 36 A 2.5 2.5 0 1 1 57.99 36', fill: '#1f2937', alwaysFill: true },
      { d: 'M 49 40 L 51 40 L 50 41.5 Z', fill: '#fca5a5', alwaysFill: true },
      { d: 'M 46 43 Q 48 45 50 43 Q 52 45 54 43' },
      { d: 'M 28 38 L 18 36' }, { d: 'M 28 41 L 16 41' }, { d: 'M 28 44 L 18 46' },
      { d: 'M 72 38 L 82 36' }, { d: 'M 72 41 L 84 41' }, { d: 'M 72 44 L 82 46' },
      { d: 'M 40 50 C 35 55 35 80 40 85 C 45 87 55 87 60 85 C 65 80 65 55 60 50 Z', fill: '#fef3c7' },
      { d: 'M 45 85 L 45 75 A 5 5 0 0 1 55 75 L 55 85', fill: '#fef3c7' },
      { d: 'M 62 80 Q 75 75 72 60 C 70 50 78 50 76 60 Q 78 82 60 85', fill: '#fef3c7' }
    ]
  },
  {
    id: 'dog',
    name: '小狗',
    pinyin: 'xiǎo gǒu',
    category: 'animal',
    paths: [
      { d: 'M 50 25 C 34 25 34 50 50 50 C 66 50 66 25 50 25 Z', fill: '#fed7aa' },
      { d: 'M 36 27 C 24 27 24 45 32 45 C 36 45 38 35 38 27 Z', fill: '#f97316' },
      { d: 'M 64 27 C 76 27 76 45 68 45 C 64 45 62 35 62 27 Z', fill: '#f97316' },
      { d: 'M 43 35 A 2.5 2.5 0 1 1 42.99 35', fill: '#1f2937', alwaysFill: true },
      { d: 'M 57 35 A 2.5 2.5 0 1 1 56.99 35', fill: '#1f2937', alwaysFill: true },
      { d: 'M 50 41 A 3.5 3 0 1 1 49.99 41', fill: '#4b5563', alwaysFill: true },
      { d: 'M 46 44 Q 50 48 54 44' },
      { d: 'M 42 50 C 36 56 36 80 42 85 C 46 87 54 87 58 85 C 64 80 64 56 58 50 Z', fill: '#fed7aa' },
      { d: 'M 42 53 Q 50 58 58 53', fill: '#ef4444' },
      { d: 'M 50 58 A 2 2 0 1 1 49.99 58', fill: '#fde047', alwaysFill: true },
      { d: 'M 46 85 C 46 76 54 76 54 85', fill: '#fed7aa' },
      { d: 'M 60 76 Q 72 72 75 62 Q 78 61 77 64 Q 74 76 58 82', fill: '#fed7aa' }
    ]
  },
  {
    id: 'bird',
    name: '小鸟',
    pinyin: 'xiǎo niǎo',
    category: 'animal',
    paths: [
      { d: 'M 30 50 C 30 35 48 30 60 38 C 72 45 75 58 60 65 C 45 72 30 65 30 50 Z', fill: '#bae6fd' },
      { d: 'M 68 44 L 78 48 L 66 52 Z', fill: '#f97316', alwaysFill: true },
      { d: 'M 54 42 A 2.5 2.5 0 1 1 53.99 42', fill: '#1f2937', alwaysFill: true },
      { d: 'M 40 50 C 42 42 52 42 50 50 C 48 56 38 56 40 50 Z', fill: '#38bdf8' },
      { d: 'M 30 50 L 16 43 L 18 50 L 16 57 L 30 54', fill: '#bae6fd' },
      { d: 'M 45 68 L 42 76' }, { d: 'M 45 68 L 48 76' },
      { d: 'M 55 68 L 52 76' }, { d: 'M 55 68 L 58 76' },
      { d: 'M 15 76 L 85 76' },
      { d: 'M 70 76 Q 75 70 80 76', fill: '#86efac' }
    ]
  },
  {
    id: 'chick',
    name: '小鸡',
    pinyin: 'xiǎo jī',
    category: 'animal',
    paths: [
      { d: 'M 50 25 C 32 25 32 68 50 68 C 68 68 68 25 50 25 Z', fill: '#fef08a' },
      { d: 'M 42 40 A 2 2 0 1 1 41.99 40', fill: '#1f2937', alwaysFill: true },
      { d: 'M 58 40 A 2 2 0 1 1 57.99 40', fill: '#1f2937', alwaysFill: true },
      { d: 'M 47 44 Q 50 41 53 44 L 50 49 Z', fill: '#f97316', alwaysFill: true },
      { d: 'M 32 46 C 26 46 26 54 32 54 Z', fill: '#fef08a' },
      { d: 'M 68 46 C 74 46 74 54 68 54 Z', fill: '#fef08a' },
      { d: 'M 50 25 Q 50 15 47 15 C 50 17 51 25 52 25 Q 55 17 55 15 C 54 20 52 25 52 25' },
      { d: 'M 44 68 L 41 78' }, { d: 'M 44 68 L 47 78' },
      { d: 'M 56 68 L 53 78' }, { d: 'M 56 68 L 59 78' }
    ]
  },
  {
    id: 'duckling',
    name: '小鸭子',
    pinyin: 'xiǎo yā zi',
    category: 'animal',
    paths: [
      { d: 'M 40 25 C 32 25 32 40 40 40 C 48 40 48 25 40 25 Z', fill: '#fef08a' },
      { d: 'M 45 30 C 52 30 52 36 45 36 Z', fill: '#f97316', alwaysFill: true },
      { d: 'M 38 31 A 2 2 0 1 1 37.99 31', fill: '#1f2937', alwaysFill: true },
      { d: 'M 38 40 Q 38 48 44 48' },
      { d: 'M 44 40 Q 46 45 48 48' },
      { d: 'M 44 48 C 30 48 25 58 35 68 C 45 76 65 76 72 64 C 76 56 72 48 60 48 Z', fill: '#fef08a' },
      { d: 'M 46 56 C 48 50 56 50 56 58 C 54 64 48 64 46 56 Z', fill: '#fde047' },
      { d: 'M 72 64 Q 82 58 80 52 Q 74 54 70 60', fill: '#fef08a' },
      { d: 'M 15 76 Q 25 73 35 76 T 55 76 T 75 76 T 85 76', fill: '#bae6fd' }
    ]
  },
  {
    id: 'elephant',
    name: '大象',
    pinyin: 'dà xiàng',
    category: 'animal',
    paths: [
      { d: 'M 55 35 C 35 35 28 45 28 65 C 28 80 38 85 55 85 C 72 85 82 80 82 65 C 82 45 72 35 55 35 Z', fill: '#bfdbfe' },
      { d: 'M 35 48 Q 20 48 22 34 Q 24 20 18 16 Q 14 20 18 26 Q 20 38 35 42 Z', fill: '#bfdbfe' },
      { d: 'M 48 38 C 36 38 36 60 48 60 C 56 60 56 38 48 38 Z', fill: '#fca5a5' },
      { d: 'M 42 42 A 2 2 0 1 1 41.99 42', fill: '#1f2937', alwaysFill: true },
      { d: 'M 38 80 L 38 92 L 46 92 L 46 84', fill: '#bfdbfe' },
      { d: 'M 48 83 L 48 92 L 56 92 L 56 85', fill: '#bfdbfe' },
      { d: 'M 64 85 L 64 92 L 72 92 L 72 83', fill: '#bfdbfe' },
      { d: 'M 74 81 L 74 92 L 80 92 L 80 80', fill: '#bfdbfe' },
      { d: 'M 82 60 Q 88 64 86 75' }
    ]
  },
  {
    id: 'giraffe',
    name: '长颈鹿',
    pinyin: 'cháng jǐng lù',
    category: 'animal',
    paths: [
      { d: 'M 50 60 C 42 60 38 68 38 78 C 38 84 44 86 52 86 C 62 86 66 84 66 78 C 66 68 62 60 50 60 Z', fill: '#fde047' },
      { d: 'M 44 64 L 44 25 L 50 25 L 50 61', fill: '#fde047' },
      { d: 'M 40 22 C 34 22 34 14 44 14 C 48 14 52 18 52 22 Z', fill: '#fde047' },
      { d: 'M 45 14 L 43 6' }, { d: 'M 42 5 A 1.5 1.5 0 1 1 41.99 5', fill: '#d97706', alwaysFill: true },
      { d: 'M 49 14 L 49 6' }, { d: 'M 49 5 A 1.5 1.5 0 1 1 48.99 5', fill: '#d97706', alwaysFill: true },
      { d: 'M 52 16 C 56 16 56 22 52 22 Z', fill: '#fca5a5' },
      { d: 'M 44 18 A 1.5 1.5 0 1 1 43.99 18', fill: '#1f2937', alwaysFill: true },
      { d: 'M 42 85 L 42 94 L 46 94 L 46 86', fill: '#fde047' },
      { d: 'M 48 86 L 48 94 L 52 94 L 52 86', fill: '#fde047' },
      { d: 'M 56 86 L 56 94 L 60 94 L 60 86', fill: '#fde047' },
      { d: 'M 62 85 L 62 94 L 66 94 L 66 84', fill: '#fde047' },
      { d: 'M 44 66 A 3 3 0 1 1 43.99 66', fill: '#f97316', alwaysFill: true },
      { d: 'M 56 68 A 4 4 0 1 1 55.99 68', fill: '#f97316', alwaysFill: true },
      { d: 'M 48 78 A 4.5 4.5 0 1 1 47.99 78', fill: '#f97316', alwaysFill: true },
      { d: 'M 47 45 A 2 2 0 1 1 46.99 45', fill: '#f97316', alwaysFill: true },
      { d: 'M 47 35 A 1.8 1.8 0 1 1 46.99 35', fill: '#f97316', alwaysFill: true },
      { d: 'M 66 72 Q 72 75 70 82' }
    ]
  }
];

const formState = ref({
  title: '儿童简笔画描红&填色',
  layout: 'single' as 'single' | 'combo' | 'grid-4' | 'grid-6',
  colorMode: true,
  outlineStyle: 'solid' as 'solid' | 'trace' | 'grey',
  strokeWidth: 0.5,
  guideLines: 'none' as 'none' | 'cross' | 'grid' | 'dot',
  showLabel: true,
  showGridBackground: false,
  selectedIds: ['fairy'] as string[]
});

const boyDrawings = computed(() => DRAWING_TEMPLATES.filter(item => item.category === 'boy'));
const girlDrawings = computed(() => DRAWING_TEMPLATES.filter(item => item.category === 'girl'));
const animalDrawings = computed(() => DRAWING_TEMPLATES.filter(item => item.category === 'animal'));
const magicDrawings = computed(() => DRAWING_TEMPLATES.filter(item => item.category === 'magic'));

const selectSingle = (id: string) => {
  formState.value.selectedIds = [id];
};

const toggleSelect = (id: string) => {
  const index = formState.value.selectedIds.indexOf(id);
  if (index > -1) {
    if (formState.value.selectedIds.length > 1) {
      formState.value.selectedIds.splice(index, 1);
    }
  } else {
    formState.value.selectedIds.push(id);
  }
};

const applyPreset = (preset: 'all' | 'boy' | 'girl' | 'animal' | 'magic' | 'clear') => {
  if (preset === 'all') {
    formState.value.selectedIds = DRAWING_TEMPLATES.map(item => item.id);
  } else if (preset === 'boy') {
    formState.value.selectedIds = boyDrawings.value.map(item => item.id);
  } else if (preset === 'girl') {
    formState.value.selectedIds = girlDrawings.value.map(item => item.id);
  } else if (preset === 'animal') {
    formState.value.selectedIds = animalDrawings.value.map(item => item.id);
  } else if (preset === 'magic') {
    formState.value.selectedIds = magicDrawings.value.map(item => item.id);
  } else if (preset === 'clear') {
    formState.value.selectedIds = ['fairy'];
  }
};

const chunk = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const pages = computed(() => {
  const selectedItems = DRAWING_TEMPLATES.filter(item => formState.value.selectedIds.includes(item.id));
  
  if (selectedItems.length === 0) {
    return [[DRAWING_TEMPLATES[0]]];
  }
  
  if (formState.value.layout === 'single' || formState.value.layout === 'combo') {
    return selectedItems.map(item => [item]);
  }
  
  const size = formState.value.layout === 'grid-4' ? 4 : 6;
  const chunked = chunk(selectedItems, size);
  
  if (chunked.length > 0) {
    const lastPage = chunked[chunked.length - 1];
    while (lastPage.length < size) {
      // @ts-ignore
      lastPage.push({
        id: `empty-${lastPage.length}`,
        name: '自由创作',
        pinyin: 'zì yóu chuàng zuò',
        category: 'boy',
        paths: [],
        isEmpty: true
      });
    }
  }
  return chunked;
});

const paperTitle = computed(() => formState.value.title || '儿童简笔画');

const getFillColor = (path: DrawingPath) => {
  if (formState.value.colorMode) {
    return path.fill || 'none';
  }
  if (path.alwaysFill && path.fill) {
    const fill = path.fill.toLowerCase();
    // Keep white fills
    if (fill === '#ffffff' || fill === '#fff') {
      return '#ffffff';
    }
    // Keep dark grey/black (eyes, pupils, wheels)
    if (fill === '#1f2937' || fill === '#374151' || fill === '#4b5563' || fill === '#9ca3af' || fill === '#cbd5e1') {
      return fill;
    }
    // Fill blue eyes (princess, robot) with black so they don't look creepy/hollow
    if (fill === '#60a5fa' || fill === '#93c5fd') {
      if (path.d.includes('A ') || path.d.includes('a ')) {
        return '#1f2937';
      }
      return 'none';
    }
    // Hide colorful details (cheeks, stars, crown jewels, spots, beaks) so children can color them
    return 'none';
  }
  return 'none';
};

const getDrawingStyle = (forceType?: 'solid' | 'trace' | 'grey') => {
  const style = forceType || formState.value.outlineStyle;
  
  let stroke = '#1d2939';
  let dashArray: string | undefined = undefined;
  
  if (style === 'trace') {
    dashArray = '4 4';
  } else if (style === 'grey') {
    stroke = '#cbd5e1';
  }
  
  const strokeWidth = formState.value.strokeWidth;
  
  return {
    stroke,
    'stroke-dasharray': dashArray,
    'stroke-width': strokeWidth
  };
};

const printPaper = () => {
  printElement('drawing-printable-paper', paperTitle.value);
};

const downloadPDF = () => {
  const element = document.getElementById('drawing-printable-paper');
  if (!element) return;
  element.classList.add('exporting');
  const sourceElement = getPdfSourceElement(element);
  
  const opt = {
    margin:       0,
    filename:     `${paperTitle.value}.pdf`,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, windowWidth: 794 },
    jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak:    { mode: ['css'] }
  };
  
  html2pdf().set(opt).from(sourceElement).save().finally(() => {
    element.classList.remove('exporting');
  });
};
</script>

<template>
  <div class="generator-container">
    <!-- Settings Panel -->
    <a-card class="settings-panel no-print" :bordered="false" title="生成设置">
      <a-form layout="vertical" :model="formState">
        <a-form-item label="主标题">
          <a-input v-model:value="formState.title" placeholder="儿童简笔画描红&填色" />
        </a-form-item>

        <a-form-item label="页面排版">
          <a-select v-model:value="formState.layout">
            <a-select-option value="single">单图填色 (大图)</a-select-option>
            <a-select-option value="combo">描红临摹 (对比卡)</a-select-option>
            <a-select-option value="grid-4">四合一卡片 (2x2 网格)</a-select-option>
            <a-select-option value="grid-6">六合一卡片 (2x3 网格)</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="色彩模式">
          <a-radio-group v-model:value="formState.colorMode" option-type="button" button-style="solid">
            <a-radio-button :value="false">黑白线稿</a-radio-button>
            <a-radio-button :value="true">彩色漫画</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="描线类型">
          <a-radio-group v-model:value="formState.outlineStyle" option-type="button" button-style="solid">
            <a-radio-button value="solid">实线</a-radio-button>
            <a-radio-button value="trace">虚线</a-radio-button>
            <a-radio-button value="grey">灰线</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="描线粗细">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <a-slider 
              v-model:value="formState.strokeWidth" 
              :min="0.1" 
              :max="6" 
              :step="0.1" 
              style="flex-grow: 1; margin: 0 6px;"
            />
            <a-input-number 
              v-model:value="formState.strokeWidth" 
              :min="0.1" 
              :max="6" 
              :step="0.1" 
              style="width: 70px; flex-shrink: 0;" 
            />
          </div>
        </a-form-item>

        <a-form-item label="辅助格线">
          <a-radio-group v-model:value="formState.guideLines" option-type="button" button-style="solid">
            <a-radio-button value="none">无</a-radio-button>
            <a-radio-button value="cross">十字</a-radio-button>
            <a-radio-button value="grid">九宫格</a-radio-button>
            <a-radio-button value="dot">点阵</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="其他选项">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a-checkbox v-model:checked="formState.showLabel">显示名称和拼音</a-checkbox>
            <a-checkbox v-model:checked="formState.showGridBackground">显示背景纸张底纹</a-checkbox>
          </div>
        </a-form-item>

        <!-- Presets for selection -->
        <a-divider style="margin: 12px 0;" />
        <div class="selection-header">
          <span>选择画作 (已选 {{ formState.selectedIds.length }} 个)</span>
          <div class="preset-buttons" v-if="formState.layout === 'grid-4' || formState.layout === 'grid-6'">
            <a-button size="small" type="text" @click="applyPreset('magic')">魔法</a-button>
            <a-button size="small" type="text" @click="applyPreset('boy')">男孩</a-button>
            <a-button size="small" type="text" @click="applyPreset('girl')">女孩</a-button>
            <a-button size="small" type="text" @click="applyPreset('animal')">动物</a-button>
            <a-button size="small" type="text" @click="applyPreset('clear')">清空</a-button>
          </div>
        </div>

        <div class="drawings-selector-box">
          <!-- Magic Fairy Tales -->
          <div class="category-group">
            <span class="group-title">魔法童话类 (小精灵、蘑菇屋、发光萌宠)</span>
            <div class="thumbnails-grid">
              <button 
                v-for="item in magicDrawings" 
                :key="item.id"
                type="button"
                class="thumb-btn"
                :class="{ 
                  active: formState.selectedIds.includes(item.id),
                  single: formState.layout === 'single' || formState.layout === 'combo'
                }"
                @click="formState.layout === 'single' || formState.layout === 'combo' ? selectSingle(item.id) : toggleSelect(item.id)"
              >
                <div class="thumb-svg-wrap">
                  <svg viewBox="0 0 100 100" :class="{ 'comic-style': formState.colorMode }">
                    <path 
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      stroke="#4b5563" 
                      stroke-width="2.2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <span class="thumb-name">{{ item.name }}</span>
                <span class="selected-badge" v-if="formState.selectedIds.includes(item.id)">
                  <CheckOutlined />
                </span>
              </button>
            </div>
          </div>

          <!-- Boys -->
          <div class="category-group">
            <span class="group-title">男孩类 (男生、载具、机械)</span>
            <div class="thumbnails-grid">
              <button 
                v-for="item in boyDrawings" 
                :key="item.id"
                type="button"
                class="thumb-btn"
                :class="{ 
                  active: formState.selectedIds.includes(item.id),
                  single: formState.layout === 'single' || formState.layout === 'combo'
                }"
                @click="formState.layout === 'single' || formState.layout === 'combo' ? selectSingle(item.id) : toggleSelect(item.id)"
              >
                <div class="thumb-svg-wrap">
                  <svg viewBox="0 0 100 100" :class="{ 'comic-style': formState.colorMode }">
                    <path 
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      stroke="#4b5563" 
                      stroke-width="2.2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <span class="thumb-name">{{ item.name }}</span>
                <span class="selected-badge" v-if="formState.selectedIds.includes(item.id)">
                  <CheckOutlined />
                </span>
              </button>
            </div>
          </div>

          <!-- Girls -->
          <div class="category-group">
            <span class="group-title">女孩类 (公主、可爱、自然)</span>
            <div class="thumbnails-grid">
              <button 
                v-for="item in girlDrawings" 
                :key="item.id"
                type="button"
                class="thumb-btn"
                :class="{ 
                  active: formState.selectedIds.includes(item.id),
                  single: formState.layout === 'single' || formState.layout === 'combo'
                }"
                @click="formState.layout === 'single' || formState.layout === 'combo' ? selectSingle(item.id) : toggleSelect(item.id)"
              >
                <div class="thumb-svg-wrap">
                  <svg viewBox="0 0 100 100" :class="{ 'comic-style': formState.colorMode }">
                    <path 
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      stroke="#4b5563" 
                      stroke-width="2.2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <span class="thumb-name">{{ item.name }}</span>
                <span class="selected-badge" v-if="formState.selectedIds.includes(item.id)">
                  <CheckOutlined />
                </span>
              </button>
            </div>
          </div>

          <!-- Animals -->
          <div class="category-group">
            <span class="group-title">动物类 (可爱陆空萌宠)</span>
            <div class="thumbnails-grid">
              <button 
                v-for="item in animalDrawings" 
                :key="item.id"
                type="button"
                class="thumb-btn"
                :class="{ 
                  active: formState.selectedIds.includes(item.id),
                  single: formState.layout === 'single' || formState.layout === 'combo'
                }"
                @click="formState.layout === 'single' || formState.layout === 'combo' ? selectSingle(item.id) : toggleSelect(item.id)"
              >
                <div class="thumb-svg-wrap">
                  <svg viewBox="0 0 100 100" :class="{ 'comic-style': formState.colorMode }">
                    <path 
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      stroke="#4b5563" 
                      stroke-width="2.2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <span class="thumb-name">{{ item.name }}</span>
                <span class="selected-badge" v-if="formState.selectedIds.includes(item.id)">
                  <CheckOutlined />
                </span>
              </button>
            </div>
          </div>
        </div>

        <a-divider style="margin: 16px 0;" />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper">
            <template #icon><PrinterOutlined /></template>
            直接打印
          </a-button>
          <a-button block size="large" style="margin-top: 12px" @click="downloadPDF">
            <template #icon><DownloadOutlined /></template>
            下载 PDF
          </a-button>
        </div>
      </a-form>
    </a-card>

    <!-- Preview Panel -->
    <div class="preview-panel print-full-width">
      <div class="paper-stack" id="drawing-printable-paper">
        <div 
          v-for="(pageItems, pageIndex) in pages" 
          :key="pageIndex" 
          class="paper-container"
          :class="{ 
            'has-next-page': pageIndex < pages.length - 1,
            'grid-background': formState.showGridBackground
          }"
        >
          <!-- A4 Header Banner -->
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>画画人：__________</span>
              <span>年龄：______ 岁</span>
              <span>日期：__________</span>
              <span>评价：⭐️⭐️⭐️⭐️⭐️</span>
              <span class="page-number" v-if="pages.length > 1">{{ pageIndex + 1 }} / {{ pages.length }}</span>
            </div>
          </div>

          <!-- Page Content Layouts -->
          <div class="paper-content-area">
            <!-- 1. Single Large Drawing Layout -->
            <div v-if="formState.layout === 'single'" class="single-layout">
              <div class="canvas-card">
                <svg viewBox="0 0 100 100" class="main-svg" :class="{ 'comic-style': formState.colorMode }">
                  <!-- Guide lines -->
                  <g v-if="formState.guideLines !== 'none'" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2 2">
                    <path v-if="formState.guideLines === 'cross'" d="M 50 0 L 50 100 M 0 50 L 100 50" />
                    <path v-if="formState.guideLines === 'grid'" d="M 33.3 0 L 33.3 100 M 66.6 0 L 66.6 100 M 0 33.3 L 100 33.3 M 0 66.6 L 100 66.6" />
                    <path v-if="formState.guideLines === 'dot'" d="M 20 20 L 20 20 M 40 20 L 40 20 M 60 20 L 60 20 M 80 20 L 80 20 M 20 40 L 20 40 M 40 40 L 40 40 M 60 40 L 60 40 M 80 40 L 80 40 M 20 60 L 20 60 M 40 60 L 40 60 M 60 60 L 60 60 M 80 60 L 80 60 M 20 80 L 20 80 M 40 80 L 40 80 M 60 80 L 60 80 M 80 80 L 80 80" stroke-linecap="round" stroke-width="2.5" stroke-dasharray="none" />
                  </g>
                  <!-- Drawing Paths -->
                  <path 
                    v-for="(p, pi) in pageItems[0].paths" 
                    :key="pi" 
                    :d="p.d" 
                    :fill="getFillColor(p)"
                    v-bind="getDrawingStyle()"
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                  />
                </svg>
              </div>
              <div class="label-box" v-if="formState.showLabel && !pageItems[0].isEmpty">
                <div class="pinyin-text">{{ pageItems[0].pinyin }}</div>
                <div class="name-text">{{ pageItems[0].name }}</div>
              </div>
            </div>

            <!-- 2. Combo Tracing & Drawing Layout -->
            <div v-else-if="formState.layout === 'combo'" class="combo-layout">
              <!-- Top Half: Reference -->
              <div class="combo-half top-ref">
                <span class="card-tag">临摹对照 (Reference)</span>
                <div class="ref-canvas" :class="{ 'comic-style': formState.colorMode }">
                  <svg viewBox="0 0 100 100">
                    <path 
                      v-for="(p, pi) in pageItems[0].paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      v-bind="getDrawingStyle('solid')"
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <div class="label-box mini" v-if="formState.showLabel && !pageItems[0].isEmpty">
                  <span class="pinyin-text inline">{{ pageItems[0].pinyin }}</span>
                  <span class="name-text inline">（{{ pageItems[0].name }}）</span>
                </div>
              </div>

              <!-- Bottom Half: Trace & Draw side by side -->
              <div class="combo-bottom-grid">
                <div class="combo-half">
                  <span class="card-tag">描红练习 (Trace)</span>
                  <div class="grid-canvas">
                    <svg viewBox="0 0 100 100" :class="{ 'comic-style': formState.colorMode }">
                      <!-- Guide lines -->
                      <g v-if="formState.guideLines !== 'none'" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2 2">
                        <path v-if="formState.guideLines === 'cross'" d="M 50 0 L 50 100 M 0 50 L 100 50" />
                        <path v-if="formState.guideLines === 'grid'" d="M 33.3 0 L 33.3 100 M 66.6 0 L 66.6 100 M 0 33.3 L 100 33.3 M 0 66.6 L 100 66.6" />
                        <path v-if="formState.guideLines === 'dot'" d="M 20 20 L 20 20 M 40 20 L 40 20 M 60 20 L 60 20 M 80 20 L 80 20 M 20 40 L 20 40 M 40 40 L 40 40 M 60 40 L 60 40 M 80 40 L 80 40 M 20 60 L 20 60 M 40 60 L 40 60 M 60 60 L 60 60 M 80 60 L 80 60 M 20 80 L 20 80 M 40 80 L 40 80 M 60 80 L 60 80 M 80 80 L 80 80" stroke-linecap="round" stroke-width="2.5" stroke-dasharray="none" />
                      </g>
                      <!-- Drawing outline trace -->
                      <path 
                        v-for="(p, pi) in pageItems[0].paths" 
                        :key="pi" 
                        :d="p.d" 
                        :fill="getFillColor(p)"
                        v-bind="getDrawingStyle()"
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                      />
                    </svg>
                  </div>
                </div>

                <div class="combo-half">
                  <span class="card-tag">创意工坊 (Draw)</span>
                  <div class="grid-canvas empty-box">
                    <svg viewBox="0 0 100 100">
                      <!-- Guide lines -->
                      <g v-if="formState.guideLines !== 'none'" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2 2">
                        <path v-if="formState.guideLines === 'cross'" d="M 50 0 L 50 100 M 0 50 L 100 50" />
                        <path v-if="formState.guideLines === 'grid'" d="M 33.3 0 L 33.3 100 M 66.6 0 L 66.6 100 M 0 33.3 L 100 33.3 M 0 66.6 L 100 66.6" />
                        <path v-if="formState.guideLines === 'dot'" d="M 20 20 L 20 20 M 40 20 L 40 20 M 60 20 L 60 20 M 80 20 L 80 20 M 20 40 L 20 40 M 40 40 L 40 40 M 60 40 L 60 40 M 80 40 L 80 40 M 20 60 L 20 60 M 40 60 L 40 60 M 60 60 L 60 60 M 80 60 L 80 60 M 20 80 L 20 80 M 40 80 L 40 80 M 60 80 L 60 80 M 80 80 L 80 80" stroke-linecap="round" stroke-width="2.5" stroke-dasharray="none" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Grid-4 Layout (2x2 Grid) -->
            <div v-else-if="formState.layout === 'grid-4'" class="grid-layout cols-2">
              <div 
                v-for="item in pageItems" 
                :key="item.id" 
                class="grid-cell"
              >
                <div class="grid-canvas-box">
                  <svg viewBox="0 0 100 100" class="grid-cell-svg" :class="{ 'comic-style': formState.colorMode }">
                    <!-- Guide lines -->
                    <g v-if="formState.guideLines !== 'none'" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2 2">
                      <path v-if="formState.guideLines === 'cross'" d="M 50 0 L 50 100 M 0 50 L 100 50" />
                      <path v-if="formState.guideLines === 'grid'" d="M 33.3 0 L 33.3 100 M 66.6 0 L 66.6 100 M 0 33.3 L 100 33.3 M 0 66.6 L 100 66.6" />
                      <path v-if="formState.guideLines === 'dot'" d="M 20 20 L 20 20 M 40 20 L 40 20 M 60 20 L 60 20 M 80 20 L 80 20 M 20 40 L 20 40 M 40 40 L 40 40 M 60 40 L 60 40 M 80 40 L 80 40 M 20 60 L 20 60 M 40 60 L 40 60 M 60 60 L 60 60 M 80 60 L 80 60 M 20 80 L 20 80 M 40 80 L 40 80 M 60 80 L 60 80 M 80 80 L 80 80" stroke-linecap="round" stroke-width="2" stroke-dasharray="none" />
                    </g>
                    <!-- Drawing outline -->
                    <path 
                      v-if="!item.isEmpty"
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      v-bind="getDrawingStyle()"
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <div class="label-box compact" v-if="formState.showLabel">
                  <div class="pinyin-text">{{ item.pinyin }}</div>
                  <div class="name-text">{{ item.name }}</div>
                </div>
              </div>
            </div>

            <!-- 4. Grid-6 Layout (2x3 Grid) -->
            <div v-else-if="formState.layout === 'grid-6'" class="grid-layout cols-2 rows-3">
              <div 
                v-for="item in pageItems" 
                :key="item.id" 
                class="grid-cell compact"
              >
                <div class="grid-canvas-box compact">
                  <svg viewBox="0 0 100 100" class="grid-cell-svg compact" :class="{ 'comic-style': formState.colorMode }">
                    <!-- Guide lines -->
                    <g v-if="formState.guideLines !== 'none'" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2 2">
                      <path v-if="formState.guideLines === 'cross'" d="M 50 0 L 50 100 M 0 50 L 100 50" />
                      <path v-if="formState.guideLines === 'grid'" d="M 33.3 0 L 33.3 100 M 66.6 0 L 66.6 100 M 0 33.3 L 100 33.3 M 0 66.6 L 100 66.6" />
                      <path v-if="formState.guideLines === 'dot'" d="M 20 20 L 20 20 M 40 20 L 40 20 M 60 20 L 60 20 M 80 20 L 80 20 M 20 40 L 20 40 M 40 40 L 40 40 M 60 40 L 60 40 M 80 40 L 80 40 M 20 60 L 20 60 M 40 60 L 40 60 M 60 60 L 60 60 M 80 60 L 80 60 M 20 80 L 20 80 M 40 80 L 40 80 M 60 80 L 60 80 M 80 80 L 80 80" stroke-linecap="round" stroke-width="2" stroke-dasharray="none" />
                    </g>
                    <!-- Drawing outline -->
                    <path 
                      v-if="!item.isEmpty"
                      v-for="(p, pi) in item.paths" 
                      :key="pi" 
                      :d="p.d" 
                      :fill="getFillColor(p)"
                      v-bind="getDrawingStyle()"
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                    />
                  </svg>
                </div>
                <div class="label-box compact-x" v-if="formState.showLabel">
                  <div class="pinyin-text">{{ item.pinyin }}</div>
                  <div class="name-text">{{ item.name }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- A4 Footer -->
          <div class="paper-footer">向日葵简笔画打印网　https://sunflower.ccwu.cc</div>
        </div>
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
  width: 340px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(60, 54, 38, 0.08);
  overflow-y: auto;
  background: #fffdf7;
}

.settings-panel :deep(.ant-card-body) {
  padding: 16px;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  margin-bottom: 8px;
}

.preset-buttons {
  display: flex;
  gap: 2px;
}

.preset-buttons :deep(.ant-btn-text) {
  padding: 0 4px;
  font-size: 12px;
  color: #722ed1;
  height: auto;
}

.drawings-selector-box {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  background: #fbfbfa;
}

.category-group {
  margin-bottom: 12px;
}

.group-title {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 6px;
  border-bottom: 1px dashed #e5e7eb;
  padding-bottom: 2px;
}

.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.thumb-btn {
  position: relative;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.thumb-btn:hover {
  border-color: #d3adf7;
  background: #f9f0ff;
}

.thumb-btn.active {
  border-color: #722ed1;
  background: #f9f0ff;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
}

.thumb-btn.single.active {
  border-color: #2f7d46;
  background: #e8f3ea;
  box-shadow: 0 0 0 2px rgba(47, 125, 70, 0.1);
}

.thumb-btn.single.active .selected-badge {
  background: #2f7d46;
}

.thumb-svg-wrap {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-svg-wrap svg {
  max-width: 100%;
  max-height: 100%;
}

.thumb-name {
  font-size: 11px;
  color: #4b5563;
  margin-top: 2px;
  text-align: center;
  font-weight: 500;
}

.selected-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #722ed1;
  color: #ffffff;
  font-size: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.action-buttons :deep(.ant-btn-primary) {
  background: #722ed1;
  border-color: #722ed1;
}

.action-buttons :deep(.ant-btn-primary:hover) {
  background: #873bf4;
  border-color: #873bf4;
}

.preview-panel {
  flex-grow: 1;
  background: #eee8dc;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 24px;
}

.paper-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.paper-container {
  width: 210mm;
  height: 296mm;
  box-sizing: border-box;
  background: #ffffff;
  padding: 15mm 15mm 15mm 15mm;
  box-shadow: 0 18px 44px rgba(60, 54, 38, 0.16);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.paper-container.grid-background {
  background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
  background-size: 10mm 10mm;
}

.paper-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 6mm;
}

.paper-header h2 {
  text-align: center;
  font-size: 26px;
  font-family: "Kaiti", "STKaiti", "Microsoft YaHei", serif;
  font-weight: bold;
  color: #111827;
  margin: 0 0 4mm;
  letter-spacing: 2px;
}

.paper-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #4b5563;
  border-bottom: 1.5px solid #111827;
  padding-bottom: 3mm;
  line-height: 1.2;
}

.page-number {
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
}

.paper-content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.single-layout {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10mm 0;
}

.single-layout .canvas-card {
  width: 175mm;
  height: 175mm;
  margin: 0 auto;
  border: 2px solid #111827;
  border-radius: 12px;
  padding: 10px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-svg {
  width: 100%;
  height: 100%;
}

/* Comic hand-drawn drop-shadow style */
svg.comic-style {
  filter: drop-shadow(3px 3px 0px rgba(29, 41, 57, 0.16));
  transition: filter 0.25s ease;
}

.label-box {
  text-align: center;
  margin-top: 6mm;
  font-family: "Kaiti", "STKaiti", "Microsoft YaHei", serif;
  line-height: 1.3;
}

.label-box .pinyin-text {
  font-size: 16px;
  color: #4b5563;
  letter-spacing: 1.5px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  margin-bottom: 2px;
}

.label-box .name-text {
  font-size: 28px;
  font-weight: bold;
  color: #111827;
  letter-spacing: 3px;
}

.combo-layout {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 2mm 0;
}

.combo-half {
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1.5px solid #111827;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px 14px 12px 14px;
}

.top-ref {
  align-self: center;
  width: 130mm;
  margin-bottom: 5mm;
}

.card-tag {
  font-size: 10px;
  font-weight: bold;
  color: #ffffff;
  background: #111827;
  padding: 2px 8px;
  border-radius: 4px;
  position: absolute;
  top: 8px;
  left: 8px;
  letter-spacing: 0.5px;
}

.ref-canvas {
  width: 65mm;
  height: 65mm;
  margin: 4mm auto 0 auto;
}

.ref-canvas svg {
  width: 100%;
  height: 100%;
}

.label-box.mini {
  margin-top: 1.5mm;
  text-align: center;
}

.label-box.mini .pinyin-text {
  font-size: 12px;
}

.label-box.mini .name-text {
  font-size: 18px;
}

.combo-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6mm;
}

.grid-canvas {
  width: 100%;
  height: 75mm;
  margin-top: 4mm;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-canvas svg {
  width: 100%;
  height: 100%;
}

.empty-box {
  background-image: radial-gradient(#cbd5e1 0.8px, transparent 0.8px);
  background-size: 8mm 8mm;
  border-radius: 4px;
}

.grid-layout {
  flex-grow: 1;
  display: grid;
  gap: 8mm;
  padding: 2mm 0;
}

.grid-layout.cols-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-cell {
  border: 1.5px solid #111827;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 112mm;
}

.grid-cell.compact {
  height: 73mm;
  padding: 8px;
}

.grid-canvas-box {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.grid-cell-svg {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 85mm;
}

.grid-cell-svg.compact {
  max-height: 52mm;
}

.label-box.compact {
  margin-top: 3mm;
  border-top: 1px dashed #e5e7eb;
  padding-top: 2mm;
}

.label-box.compact .pinyin-text {
  font-size: 12px;
}

.label-box.compact .name-text {
  font-size: 20px;
}

.label-box.compact-x {
  margin-top: 1mm;
  border-top: 1px dashed #e5e7eb;
  padding-top: 1mm;
}

.label-box.compact-x .pinyin-text {
  font-size: 10px;
  margin-bottom: 0px;
}

.label-box.compact-x .name-text {
  font-size: 15px;
  letter-spacing: 1.5px;
}

.paper-footer {
  position: absolute;
  right: 15mm;
  bottom: 8mm;
  color: #9ca3af;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 10px;
  line-height: 1;
  pointer-events: none;
}

@media (max-width: 768px) {
  .generator-container {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  
  .settings-panel {
    width: 100%;
    max-height: none;
    flex-shrink: 0;
  }
  
  .drawings-selector-box {
    max-height: 250px;
  }
  
  .preview-panel {
    width: 100%;
    padding: 12px;
    overflow-x: auto;
  }
  
  .paper-stack {
    zoom: 0.45;
  }
}

@media print {
  .generator-container {
    display: block !important;
    height: auto !important;
    background: #ffffff !important;
  }
  
  .preview-panel {
    display: block !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
  }
  
  .paper-container {
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    break-after: page;
    page-break-after: always;
  }
  
  .paper-container.has-next-page {
    break-after: page;
    page-break-after: always;
  }
}
</style>
