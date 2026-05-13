import type { MathProblem, GeneratorConfig } from '../../types/math';

export const generateBasicAddition = (config: GeneratorConfig): MathProblem[] => {
  const problems: MathProblem[] = [];
  for (let i = 0; i < config.count; i++) {
    const a = Math.floor(Math.random() * config.maxNumber);
    const b = Math.floor(Math.random() * (config.maxNumber - a));
    problems.push({
      id: `add-${Date.now()}-${i}`,
      type: 'basic',
      a,
      b,
      operator: '+',
      answer: a + b,
      expression: `${a} + ${b} = ${a + b}`
    });
  }
  return problems;
};

export const generateBasicSubtraction = (config: GeneratorConfig): MathProblem[] => {
  const problems: MathProblem[] = [];
  for (let i = 0; i < config.count; i++) {
    const a = Math.floor(Math.random() * config.maxNumber);
    const b = Math.floor(Math.random() * a); // ensure no negative
    problems.push({
      id: `sub-${Date.now()}-${i}`,
      type: 'basic',
      a,
      b,
      operator: '-',
      answer: a - b,
      expression: `${a} - ${b} = ${a - b}`
    });
  }
  return problems;
};

export const generateMixedArithmetic = (config: GeneratorConfig): MathProblem[] => {
  const problems: MathProblem[] = [];

  while (problems.length < config.count) {
    const a = Math.floor(Math.random() * config.maxNumber);
    const b = Math.floor(Math.random() * config.maxNumber);
    const operator = Math.random() > 0.5 ? '+' : '-';
    const firstResult = operator === '+' ? a + b : a - b;

    if (firstResult < 0 || firstResult > config.maxNumber) continue;

    const operator2 = Math.random() > 0.5 ? '+' : '-';
    const cLimit = operator2 === '+' ? config.maxNumber - firstResult : firstResult;
    const c = Math.floor(Math.random() * (cLimit + 1));
    const answer = operator2 === '+' ? firstResult + c : firstResult - c;

    problems.push({
      id: `mixed-${Date.now()}-${problems.length}`,
      type: 'basic',
      a,
      b,
      c,
      operator,
      operator2,
      answer,
      expression: `${a} ${operator} ${b} ${operator2} ${c} = ${answer}`
    });
  }

  return problems;
};
