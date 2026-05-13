<script setup lang="ts">
import { computed } from 'vue';
import type { MathProblem } from '../../types/math';

const props = defineProps<{
  problem: MathProblem;
  showAnswer: boolean;
}>();

// Break-ten subtraction (e.g. 15 - 9):
//   left split    = a % 10
//   right split   = 10
//   intermediate  = 10 - (b - a % 10)
const leftSplit = computed(() => (props.problem.splitNodes?.left ?? props.problem.a % 10));
const rightSplit = computed(() => (props.problem.splitNodes?.right ?? 10));
const remainder = computed(() => Number(props.problem.b) - Number(leftSplit.value));
const intermediate = computed(() => Number(rightSplit.value) - Number(remainder.value));
</script>

<template>
  <!--
    Matches the reference break-ten layout:
      15 - 9 = []
        / \
       []  []
           `--|
             -
             []
  -->
  <svg class="split-tree" viewBox="0 0 210 160" preserveAspectRatio="xMidYMid meet">
    <!-- Top equation row -->
    <text x="45" y="18" class="t glyph">{{ problem.a }}</text>
    <text x="82" y="18" class="t glyph">{{ problem.operator }}</text>
    <text x="120" y="18" class="t glyph">{{ problem.b }}</text>
    <text x="158" y="18" class="t glyph">=</text>
    <rect x="177" y="2" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="189" y="16" class="t ans">{{ problem.answer }}</text>

    <!-- Branch lines from minuend down to the two split boxes -->
    <line x1="38" y1="40" x2="30" y2="60" class="line" />
    <line x1="55" y1="40" x2="70" y2="60" class="line" />

    <!-- Two split boxes -->
    <rect x="9" y="72" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="21" y="86" class="t ans">{{ leftSplit }}</text>

    <rect x="59" y="72" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="71" y="86" class="t ans">{{ rightSplit }}</text>

    <!-- Step line from the right split box to the subtrahend column -->
    <line x1="71" y1="96" x2="71" y2="116" class="line" />
    <line x1="71" y1="116" x2="120" y2="116" class="line" />
    <line x1="120" y1="42" x2="120" y2="116" class="line" />

    <!-- Minus sign at the inside of the bend -->
    <text x="95" y="108" class="t glyph small">-</text>

    <!-- Intermediate answer box -->
    <rect x="83" y="128" width="24" height="24" class="box" />
    <text v-if="showAnswer" x="95" y="142" class="t ans">{{ intermediate }}</text>
  </svg>
</template>

<style scoped>
.split-tree {
  display: block;
  width: 210px;
  height: 160px;
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

.t.glyph { font-size: 14px; }
.t.glyph.small { font-size: 12px; }

.t.ans {
  fill: #ff0000;
  font-size: 12px;
}
</style>
