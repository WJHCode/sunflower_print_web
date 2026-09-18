<script setup lang="ts">
const numbers = Array.from({ length: 11 }, (_, value) => String(value));
const practiceCells = 14;
// Each standalone numeral is mapped from its own outline bounds to x=4–49,
// which is the full left half of the 100-unit Tianzi grid (with a tiny writing
// margin). This avoids system-font metrics making narrow digits look shrunken.
const digitTransforms: Record<string, string> = {
  '0': 'translate(-15.2 -6) scale(0.833 1.1)',
  '1': 'translate(-17.2 -6) scale(0.849 1.1)',
  '2': 'translate(-15.4 -6) scale(0.776 1.1)',
  '3': 'translate(-16.8 -6) scale(0.833 1.1)',
  '4': 'translate(-13.2 -6) scale(0.818 1.1)',
  '5': 'translate(-13.6 -6) scale(0.763 1.1)',
  '6': 'translate(-7.1 -6) scale(0.692 1.1)',
  '7': 'translate(-14 -6) scale(0.818 1.1)',
  '8': 'translate(-13.7 -6) scale(0.804 1.1)',
  '9': 'translate(-14.3 -6) scale(0.833 1.1)',
};

const getDigitTransform = (number: string) => digitTransforms[number];

// Use single-stroke teaching paths instead of font outlines, so the sample and
// tracing guides follow the same writing shape at every size.
const digitPaths: Record<string, string[]> = {
  '0': ['M50 12 C31 12 23 33 23 60 C23 88 32 108 50 108 C68 108 77 88 77 60 C77 33 69 12 50 12'],
  '1': ['M78 12 L25 108'],
  '2': ['M26 29 C30 10 65 9 74 27 C83 46 66 62 48 78 L25 105 L78 105'],
  '3': ['M27 18 C47 8 73 13 75 34 C76 48 65 56 52 59 C69 60 79 73 74 91 C69 109 42 112 25 99'],
  // 4: the primary-school “little flag” form: short left slant, horizontal,
  // then a long stem that falls slightly left. Keep all three strokes separate.
  '4': ['M42 12 L21 74', 'M21 74 L77 74', 'M63 12 L58 108'],
  '5': ['M32 16 L27 55 C44 48 67 52 73 70 C82 98 60 112 39 105 C30 102 25 96 23 91', 'M32 16 L75 16'],
  '6': ['M72 22 C62 9 41 15 31 35 C16 69 24 106 50 106 C73 106 81 83 70 66 C59 49 35 55 27 71'],
  '7': ['M22 14 L77 14 L39 108'],
  '8': ['M50 59 C67 55 76 43 75 30 C74 8 28 8 25 30 C24 43 33 55 50 59 C70 62 78 76 74 92 C69 111 31 111 26 92 C22 76 30 62 50 59'],
  '9': ['M72 42 C72 59 61 70 46 70 C29 70 22 59 23 43 C24 24 35 12 51 12 C68 12 76 25 74 44 C72 66 62 84 43 108'],
  '10': ['M49 7 L4 113', 'M74 8 C60 8 53 30 53 60 C53 91 60 112 74 112 C88 112 96 91 96 60 C96 30 88 8 74 8'],
};
</script>

<template>
  <div class="number-tracing-sheet" aria-label="0 到 10 数字描红练习">
    <div v-for="number in numbers" :key="number" class="number-tracing-row">
      <div class="number-tracing-cell sample-cell">
        <svg class="number-glyph sample-glyph" viewBox="0 0 100 120" aria-label="数字示范">
          <g :transform="getDigitTransform(number)">
            <path v-for="(path, index) in digitPaths[number]" :key="index" :d="path" />
          </g>
        </svg>
      </div>
      <div v-for="cell in practiceCells" :key="cell" class="number-tracing-cell trace-cell">
        <svg class="number-glyph trace-glyph" viewBox="0 0 100 120" aria-hidden="true">
          <g :transform="getDigitTransform(number)">
            <path v-for="(path, index) in digitPaths[number]" :key="index" :d="path" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.number-tracing-sheet {
  display: grid;
  height: 218mm;
  align-content: space-between;
  padding-top: 1mm;
}

.number-tracing-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  justify-content: center;
}

.number-tracing-cell {
  position: relative;
  display: flex;
  box-sizing: border-box;
  width: 12mm;
  height: 12mm;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #1597bd;
  border-right: 1px solid #1597bd;
  border-bottom: 1px solid #1597bd;
  overflow: hidden;
}

.number-tracing-cell:first-child {
  border-left: 1px solid #1597bd;
}

.number-tracing-cell::before,
.number-tracing-cell::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.number-tracing-cell::before {
  top: 0;
  left: 50%;
  height: 100%;
  border-left: 1px dotted rgba(21, 151, 189, 0.72);
}

.number-tracing-cell::after {
  top: 50%;
  left: 0;
  width: 100%;
  border-top: 1px dotted rgba(21, 151, 189, 0.72);
}

.sample-cell {
  border-color: #c64a4a;
}

.sample-cell:first-child {
  border-left-color: #c64a4a;
}

.sample-cell::before,
.sample-cell::after {
  border-color: rgba(198, 74, 74, 0.55);
}

.number-glyph {
  position: relative;
  z-index: 1;
  font-family: "Arial Rounded MT Bold", "Arial Rounded MT", "Trebuchet MS", sans-serif;
}

.sample-glyph {
  width: 12mm;
  height: 12mm;
  fill: none;
  stroke: #171313;
  stroke-width: 4.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trace-glyph {
  width: 12mm;
  height: 12mm;
  overflow: visible;
}

.trace-glyph {
  fill: none;
  stroke: rgba(107, 117, 120, 0.5);
  stroke-width: 4;
  stroke-dasharray: 8 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
