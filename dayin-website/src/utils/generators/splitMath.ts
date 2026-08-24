import type { MathProblem, GeneratorConfig } from '../../types/math';

const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const generateBreakTen = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number }> = [];
  // Break-ten is usually for subtraction where 10 < a < 20, and a % 10 < b
  // e.g. 15 - 8
  for (let a = 11; a <= 19; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a % 10 < b && a > b) {
        candidates.push({ a, b });
      }
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b }, index) => ({
      id: `break-${Date.now()}-${index}`,
      type: 'split-tree',
      a,
      b,
      operator: '-',
      answer: a - b,
      expression: `${a} - ${b} = ${a - b}`,
      splitNodes: {
        main: a,
        left: a % 10,
        right: 10,
        isLeftBreak: false
      }
    }));
};

export const generateMakeTen = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number; left: number; right: number }> = [];

  for (let a = 6; a <= 9; a++) {
    for (let b = 6; b <= 9; b++) {
      const left = 10 - a;
      const right = b - left;

      if (right > 0) {
        candidates.push({ a, b, left, right });
      }
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b, left, right }, index) => ({
      id: `make-ten-${Date.now()}-${index}`,
      type: 'make-ten',
      a,
      b,
      operator: '+',
      answer: a + b,
      expression: `${a} + ${b} = ${a + b}`,
      splitNodes: {
        main: b,
        left,
        right,
        isLeftBreak: true
      }
    }));
};

export const generateFlatTen = (config: GeneratorConfig): MathProblem[] => {
  const candidates = Array.from({ length: 9 }, (_, index) => {
    const b = index + 1;
    return { a: 10 + b, b };
  });

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b }, index) => ({
      id: `flat-ten-${Date.now()}-${index}`,
      type: 'split-tree',
      a,
      b,
      operator: '-',
      answer: 10,
      expression: `${a} - ${b} = 10`,
      splitNodes: {
        main: a,
        left: b,
        right: 10,
        isLeftBreak: false
      }
    }));
};

export const generateBorrowTen = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number; left: number; right: number }> = [];

  for (let a = 11; a <= 19; a++) {
    const left = a % 10;
    for (let b = left + 1; b <= 9; b++) {
      candidates.push({ a, b, left, right: b - left });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b, left, right }, index) => ({
      id: `borrow-ten-${Date.now()}-${index}`,
      type: 'make-ten',
      a,
      b,
      operator: '-',
      answer: a - b,
      expression: `${a} - ${b} = ${a - b}`,
      splitNodes: {
        main: b,
        left,
        right,
        isLeftBreak: true
      }
    }));
};
