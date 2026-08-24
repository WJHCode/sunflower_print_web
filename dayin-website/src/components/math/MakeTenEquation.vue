<script setup lang="ts">
import { computed } from 'vue';
import type { MathProblem } from '../../types/math';

const props = defineProps<{
  problem: MathProblem;
  showAnswer: boolean;
}>();

const leftSplit = computed(() => props.problem.splitNodes?.left ?? 10 - props.problem.a);
const rightSplit = computed(() => props.problem.splitNodes?.right ?? props.problem.b - leftSplit.value);
</script>

<template>
  <svg class="make-ten" viewBox="0 0 190 122" preserveAspectRatio="xMidYMid meet">
    <text x="42" y="18" class="t glyph">{{ problem.a }}</text>
    <text x="72" y="18" class="t glyph">{{ problem.operator }}</text>
    <text x="102" y="18" class="t glyph">{{ problem.b }}</text>
    <text x="134" y="18" class="t glyph">=</text>
    <rect x="151" y="2" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="163" y="16" class="t ans">{{ problem.answer }}</text>

    <line x1="94" y1="38" x2="80" y2="58" class="line" />
    <line x1="109" y1="38" x2="122" y2="58" class="line" />

    <rect x="66" y="70" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="78" y="84" class="t ans">{{ leftSplit }}</text>

    <text x="101.5" y="84" class="t glyph split-operator">+</text>

    <rect x="113" y="70" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="125" y="84" class="t ans">{{ rightSplit }}</text>

    <line x1="42" y1="38" x2="42" y2="104" class="line" />
    <line x1="42" y1="104" x2="78" y2="104" class="line" />
    <line x1="78" y1="94" x2="78" y2="104" class="line" />
    <text x="54" y="84" class="t glyph split-operator">{{ problem.operator }}</text>
    <text x="60" y="116" class="t glyph ten">10</text>
  </svg>
</template>

<style scoped>
.make-ten {
  display: block;
  width: 190px;
  height: 122px;
  font-family: "Arial", "Helvetica Neue", sans-serif;
  overflow: visible;
}

.box {
  fill: #fff;
  stroke: #333;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.line {
  stroke: #333;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.t {
  font-size: 14px;
  fill: #333;
  text-anchor: middle;
  font-family: inherit;
  dominant-baseline: middle;
}

.t.glyph {
  font-size: 14px;
}

.t.glyph.ten {
  font-size: 13px;
}

.t.ans {
  fill: #ff0000;
  font-size: 12px;
}
</style>
