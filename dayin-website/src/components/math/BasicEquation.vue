<script setup lang="ts">
import type { MathProblem } from '../../types/math';

const props = defineProps<{
  problem: MathProblem;
  showAnswer: boolean;
}>();

const shouldLeftAlign = () => (
  props.problem.prompt ||
  props.problem.operator === '+' ||
  props.problem.operator === '-' ||
  props.problem.operator === '×' ||
  props.problem.operator === '÷' ||
  (props.problem.c !== undefined && props.problem.operator === props.problem.operator2)
);
</script>

<template>
  <div
    class="problem-item basic-equation"
    :class="{
      'prompt-item': shouldLeftAlign(),
      'exchange-item': problem.exchangeParts
    }"
  >
    <template v-if="problem.prompt">
      <span class="equation prompt-equation">{{ problem.prompt }}</span>
      <template v-if="problem.exchangeParts">
        <template v-for="(part, index) in problem.exchangeParts" :key="`${problem.id}-${index}`">
          <span class="answer" v-if="showAnswer">{{ part.count }}</span>
          <span class="exchange-answer-box" v-else></span>
          <span class="unit">{{ part.unit }}</span>
          <span v-if="index < problem.exchangeParts.length - 1" class="joiner">和</span>
        </template>
      </template>
      <template v-else>
        <span class="answer" v-if="showAnswer">{{ problem.answer }}</span>
        <span class="answer-box" v-else></span>
        <span class="unit">{{ problem.answerUnit }}</span>
      </template>
    </template>
    <template v-else>
      <span class="equation">
      {{ problem.a }} {{ problem.operator }} {{ problem.b }}
      <template v-if="problem.c !== undefined"> {{ problem.operator2 }} {{ problem.c }}</template>
      =
      </span>
      <span class="answer" v-if="showAnswer">{{ problem.answer }}</span>
      <span class="answer-box" v-else></span>
    </template>
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
.prompt-item {
  justify-content: flex-start;
}
.exchange-item {
  font-size: 16px;
  flex-wrap: wrap;
  row-gap: 10px;
}
.equation {
  min-width: 72px;
  text-align: right;
  white-space: nowrap;
}
.prompt-item .equation {
  min-width: 0;
  text-align: left;
}
.prompt-equation {
  text-align: left;
}
.answer {
  color: #ff4d4f;
}
.answer-box {
  display: inline-block;
  width: 44px;
  border-bottom: 1px solid #333;
  transform: translateY(2px);
}
.exchange-answer-box {
  display: inline-flex;
  width: 26px;
  height: 22px;
  border: 1px solid #333;
  box-sizing: border-box;
  transform: translateY(4px);
}
.unit {
  white-space: nowrap;
}
.joiner {
  margin: 0 2px;
}
</style>
