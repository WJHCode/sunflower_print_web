import type { MathProblem, GeneratorConfig } from '../../types/math';

export const generateBreakTen = (config: GeneratorConfig): MathProblem[] => {
  const problems: MathProblem[] = [];
  let i = 0;
  // Break-ten is usually for subtraction where 10 < a < 20, and a % 10 < b
  // e.g. 15 - 8
  while (problems.length < config.count) {
    const a = Math.floor(Math.random() * 9) + 11; // 11 to 19
    const b = Math.floor(Math.random() * 8) + 2;  // 2 to 9
    
    // Condition for break-ten
    if (a % 10 < b && a > b) {
      problems.push({
        id: `break-${Date.now()}-${i}`,
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
      });
      i++;
    }
  }
  return problems;
};

export const generateMakeTen = (config: GeneratorConfig): MathProblem[] => {
  const problems: MathProblem[] = [];
  let i = 0;

  while (problems.length < config.count) {
    const a = Math.floor(Math.random() * 4) + 6; // 6 to 9
    const b = Math.floor(Math.random() * 4) + 6; // 6 to 9
    const left = 10 - a;
    const right = b - left;

    if (right <= 0) continue;

    problems.push({
      id: `make-ten-${Date.now()}-${i}`,
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
    });
    i++;
  }

  return problems;
};
