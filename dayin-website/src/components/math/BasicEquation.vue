<script setup lang="ts">
import type { MathProblem } from '../../types/math';

defineProps<{
  problem: MathProblem;
  showAnswer: boolean;
}>();
</script>

<template>
  <div class="problem-item basic-equation">
    <span class="equation">
      {{ problem.a }} {{ problem.operator }} {{ problem.b }}
      <template v-if="problem.c !== undefined"> {{ problem.operator2 }} {{ problem.c }}</template>
      =
    </span>
    <span class="answer" v-if="showAnswer">{{ problem.answer }}</span>
    <span class="answer-box" v-else></span>
  </div>
</template>

<style scoped>
.problem-item {
  font-size: 20px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  font-family: Arial, sans-serif;
  min-width: 0;
}
.equation {
  min-width: 72px;
  text-align: right;
  white-space: nowrap;
}
.answer {
  color: #ff4d4f;
}
.answer-box {
  display: inline-block;
  width: 34px;
  border-bottom: 1px solid #333;
  transform: translateY(2px);
}
</style>
