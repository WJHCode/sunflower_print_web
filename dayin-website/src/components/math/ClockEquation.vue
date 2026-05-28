<script setup lang="ts">
import type { MathProblem } from '../../types/math';

const props = defineProps<{
  problem: MathProblem;
  showAnswer: boolean;
}>();

const center = 100;
const hourHandLength = 43;
const minuteHandLength = 68;

const getPoint = (angle: number, length: number) => {
  const radians = (angle - 90) * Math.PI / 180;

  return {
    x: center + Math.cos(radians) * length,
    y: center + Math.sin(radians) * length
  };
};

const tickLine = (index: number) => {
  const angle = index * 6;
  const isHour = index % 5 === 0;
  const outer = getPoint(angle, 88);
  const inner = getPoint(angle, isHour ? 78 : 83);

  return {
    x1: inner.x,
    y1: inner.y,
    x2: outer.x,
    y2: outer.y,
    width: isHour ? 3.2 : 1.4,
    color: isHour ? '#111' : '#a8a8a8'
  };
};

const numberPosition = (number: number) => getPoint(number * 30, 65);
const hourAngle = () => ((props.problem.hour ?? 12) % 12) * 30 + (props.problem.minute ?? 0) * 0.5;
const minuteAngle = () => (props.problem.minute ?? 0) * 6;
const hourHand = () => getPoint(hourAngle(), hourHandLength);
const minuteHand = () => getPoint(minuteAngle(), minuteHandLength);
</script>

<template>
  <div class="clock-problem">
    <svg class="clock-face" viewBox="0 0 200 200" role="img" :aria-label="problem.expression">
      <circle cx="100" cy="100" r="88" class="clock-ring" />
      <line
        v-for="index in 60"
        :key="`${problem.id}-tick-${index}`"
        :x1="tickLine(index - 1).x1"
        :y1="tickLine(index - 1).y1"
        :x2="tickLine(index - 1).x2"
        :y2="tickLine(index - 1).y2"
        :stroke="tickLine(index - 1).color"
        :stroke-width="tickLine(index - 1).width"
        stroke-linecap="butt"
      />
      <text
        v-for="number in 12"
        :key="`${problem.id}-number-${number}`"
        :x="numberPosition(number).x"
        :y="numberPosition(number).y + 6"
        text-anchor="middle"
        class="clock-number"
      >
        {{ number }}
      </text>
      <line
        x1="100"
        y1="100"
        :x2="hourHand().x"
        :y2="hourHand().y"
        class="hour-hand"
        stroke-linecap="round"
      />
      <line
        x1="100"
        y1="100"
        :x2="minuteHand().x"
        :y2="minuteHand().y"
        class="minute-hand"
        stroke-linecap="round"
      />
      <circle cx="100" cy="100" r="3.6" class="clock-center" />
    </svg>
    <div class="clock-answer">
      <template v-if="showAnswer">
        <span>(</span>
        <span class="answer">{{ problem.answer }}</span>
        <span>)</span>
      </template>
      <template v-else>
        <span>(</span>
        <span class="blank hour-blank"></span>
        <span>:</span>
        <span class="blank minute-blank"></span>
        <span>)</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.clock-problem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  break-inside: avoid;
}
.clock-face {
  width: min(100%, 40mm);
  height: auto;
  display: block;
  overflow: visible;
}
.clock-ring {
  fill: #fff;
  stroke: #111;
  stroke-width: 3.4;
}
.clock-number {
  fill: #1f1f1f;
  font-family: Arial, sans-serif;
  font-size: 18px;
}
.hour-hand {
  stroke: #050505;
  stroke-width: 4.4;
}
.minute-hand {
  stroke: #050505;
  stroke-width: 2.4;
}
.clock-center {
  fill: #050505;
}
.clock-answer {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-top: 3px;
  color: #111;
  font-size: 18px;
  line-height: 1.2;
  font-family: Arial, sans-serif;
}
.blank {
  display: inline-block;
  border-bottom: 1.5px solid #333;
  transform: translateY(-2px);
}
.hour-blank {
  width: 28px;
}
.minute-blank {
  width: 34px;
}
.answer {
  color: #ff4d4f;
}
</style>
