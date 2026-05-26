import type { MathProblem, GeneratorConfig } from '../../types/math';

const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const problemKey = (problem: Pick<MathProblem, 'a' | 'b' | 'c' | 'operator' | 'operator2'>) => (
  `${problem.a}-${problem.operator}-${problem.b}-${problem.operator2 ?? ''}-${problem.c ?? ''}`
);

export const generateBasicAddition = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number }> = [];
  for (let a = 0; a <= config.maxNumber; a++) {
    for (let b = 0; b <= config.maxNumber - a; b++) {
      candidates.push({ a, b });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b }, index) => ({
      id: `add-${Date.now()}-${index}`,
      type: 'basic',
      a,
      b,
      operator: '+',
      answer: a + b,
      expression: `${a} + ${b} = ${a + b}`
    }));
};

export const generateBasicSubtraction = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number }> = [];
  for (let a = 0; a <= config.maxNumber; a++) {
    for (let b = 0; b <= a; b++) {
      candidates.push({ a, b });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b }, index) => ({
      id: `sub-${Date.now()}-${index}`,
      type: 'basic',
      a,
      b,
      operator: '-',
      answer: a - b,
      expression: `${a} - ${b} = ${a - b}`
    }));
};

export const generateMixedArithmetic = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<Pick<MathProblem, 'a' | 'b' | 'c' | 'operator' | 'operator2' | 'answer' | 'expression'>> = [];
  const seen = new Set<string>();

  for (let a = 0; a <= config.maxNumber; a++) {
    for (let b = 0; b <= config.maxNumber; b++) {
      for (const operator of ['+', '-']) {
        const firstResult = operator === '+' ? a + b : a - b;

        if (firstResult < 0 || firstResult > config.maxNumber) continue;

        for (const operator2 of ['+', '-']) {
          const cLimit = operator2 === '+' ? config.maxNumber - firstResult : firstResult;

          for (let c = 0; c <= cLimit; c++) {
            const answer = operator2 === '+' ? firstResult + c : firstResult - c;
            const key = problemKey({ a, b, c, operator, operator2 });

            if (seen.has(key)) continue;
            seen.add(key);

            candidates.push({
              a,
              b,
              c,
              operator,
              operator2,
              answer,
              expression: `${a} ${operator} ${b} ${operator2} ${c} = ${answer}`
            });
          }
        }
      }
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map((problem, index) => ({
      id: `mixed-${Date.now()}-${index}`,
      type: 'basic',
      ...problem
    }));
};
