import type { MathProblem, GeneratorConfig, ExchangePart } from '../../types/math';

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

export const generateTripleAddition = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number; c: number }> = [];
  for (let a = 0; a <= config.maxNumber; a++) {
    for (let b = 0; b <= config.maxNumber - a; b++) {
      for (let c = 0; c <= config.maxNumber - a - b; c++) {
        candidates.push({ a, b, c });
      }
    }
  }

  return shuffle(candidates).slice(0, config.count).map(({ a, b, c }, index) => ({
    id: `triple-add-${Date.now()}-${index}`,
    type: 'basic',
    a,
    b,
    c,
    operator: '+',
    operator2: '+',
    answer: a + b + c,
    expression: `${a} + ${b} + ${c} = ${a + b + c}`
  }));
};

export const generateTripleSubtraction = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number; c: number }> = [];
  for (let a = 0; a <= config.maxNumber; a++) {
    for (let b = 0; b <= a; b++) {
      for (let c = 0; c <= a - b; c++) {
        candidates.push({ a, b, c });
      }
    }
  }

  return shuffle(candidates).slice(0, config.count).map(({ a, b, c }, index) => ({
    id: `triple-sub-${Date.now()}-${index}`,
    type: 'basic',
    a,
    b,
    c,
    operator: '-',
    operator2: '-',
    answer: a - b - c,
    expression: `${a} - ${b} - ${c} = ${a - b - c}`
  }));
};

export const generateTableMultiplication = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number }> = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      candidates.push({ a, b });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b }, index) => ({
      id: `table-mul-${Date.now()}-${index}`,
      type: 'basic',
      a,
      b,
      operator: '×',
      answer: a * b,
      expression: `${a} × ${b} = ${a * b}`
    }));
};

export const generateTableDivision = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ a: number; b: number; answer: number }> = [];
  for (let answer = 1; answer <= 9; answer++) {
    for (let b = 1; b <= 9; b++) {
      candidates.push({ a: answer * b, b, answer });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ a, b, answer }, index) => ({
      id: `table-div-${Date.now()}-${index}`,
      type: 'basic',
      a,
      b,
      operator: '÷',
      answer,
      expression: `${a} ÷ ${b} = ${answer}`
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

const createPromptProblem = (
  id: string,
  index: number,
  prompt: string,
  answer: number,
  answerUnit: string
): MathProblem => ({
  id: `${id}-${Date.now()}-${index}`,
  type: 'basic',
  a: answer,
  b: 0,
  operator: '',
  answer,
  prompt,
  answerUnit,
  expression: `${prompt} ${answer}${answerUnit}`
});

export const generateCurrencyUnitConversion = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ prompt: string; answer: number; answerUnit: string }> = [];

  for (let yuan = 1; yuan <= 20; yuan++) {
    candidates.push({ prompt: `${yuan}元 =`, answer: yuan * 10, answerUnit: '角' });
    candidates.push({ prompt: `${yuan}元 =`, answer: yuan * 100, answerUnit: '分' });
  }
  for (let jiao = 1; jiao <= 20; jiao++) {
    candidates.push({ prompt: `${jiao}角 =`, answer: jiao * 10, answerUnit: '分' });
  }
  for (let yuan = 1; yuan <= 9; yuan++) {
    for (let jiao = 1; jiao <= 9; jiao++) {
      candidates.push({ prompt: `${yuan}元${jiao}角 =`, answer: yuan * 10 + jiao, answerUnit: '角' });
      candidates.push({ prompt: `${yuan}元${jiao}角 =`, answer: yuan * 100 + jiao * 10, answerUnit: '分' });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ prompt, answer, answerUnit }, index) => (
      createPromptProblem('currency-unit', index, prompt, answer, answerUnit)
    ));
};

export const generateMoneyExchange = (config: GeneratorConfig): MathProblem[] => {
  const mode = config.moneyExchangeUnitMode ?? 'yuan-jiao-fen';
  const allDenominations: Array<{ value: number; unit: string; group: 'yuan' | 'jiao' | 'fen' }> = [
    { value: 5000, unit: '张50元', group: 'yuan' },
    { value: 2000, unit: '张20元', group: 'yuan' },
    { value: 1000, unit: '张10元', group: 'yuan' },
    { value: 500, unit: '张5元', group: 'yuan' },
    { value: 100, unit: '张1元', group: 'yuan' },
    { value: 50, unit: '张5角', group: 'jiao' },
    { value: 10, unit: '张1角', group: 'jiao' },
    { value: 5, unit: '枚5分', group: 'fen' },
    { value: 1, unit: '枚1分', group: 'fen' }
  ];
  const denominations = allDenominations.filter((item) => {
    if (mode === 'yuan') return item.group === 'yuan';
    if (mode === 'yuan-jiao') return item.group !== 'fen';
    return true;
  });
  const candidates: Array<{ prompt: string; parts: ExchangePart[] }> = [];

  const formatAmount = (totalFen: number) => {
    const yuan = Math.floor(totalFen / 100);
    const jiao = Math.floor((totalFen % 100) / 10);
    const fen = totalFen % 10;
    return `${yuan}元${jiao > 0 ? `${jiao}角` : ''}${fen > 0 ? `${fen}分` : ''}`;
  };

  const splitAmount = (totalFen: number) => {
    let rest = totalFen;
    return denominations.reduce<ExchangePart[]>((parts, item) => {
      const count = Math.floor(rest / item.value);
      if (count > 0) {
        parts.push({ count, unit: item.unit });
        rest -= count * item.value;
      }
      return parts;
    }, []);
  };

  for (let yuan = 1; yuan <= 100; yuan++) {
    const minJiao = mode === 'yuan' ? 0 : 1;
    const maxJiao = mode === 'yuan' ? 0 : 9;
    const minFen = mode === 'yuan-jiao-fen' ? 1 : 0;
    const maxFen = mode === 'yuan-jiao-fen' ? 9 : 0;

    for (let jiao = minJiao; jiao <= maxJiao; jiao++) {
      for (let fen = minFen; fen <= maxFen; fen++) {
        const totalFen = yuan * 100 + jiao * 10 + fen;
        const parts = splitAmount(totalFen);
        if (parts.length < 2) continue;

        candidates.push({
          prompt: `${formatAmount(totalFen)} =`,
          parts
        });
      }
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ prompt, parts }, index) => ({
      id: `money-exchange-${Date.now()}-${index}`,
      type: 'basic',
      a: 0,
      b: 0,
      operator: '',
      answer: parts.map((part) => part.count).join(','),
      prompt,
      exchangeParts: parts,
      expression: `${prompt} ${parts.map((part) => `${part.count}${part.unit}`).join(' 和 ')}`
    }));
};

export const generateWeightUnitConversion = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ prompt: string; answer: number; answerUnit: string }> = [];

  for (let kg = 1; kg <= 20; kg++) {
    candidates.push({ prompt: `${kg}千克 =`, answer: kg * 1000, answerUnit: '克' });
  }
  for (let ton = 1; ton <= 10; ton++) {
    candidates.push({ prompt: `${ton}吨 =`, answer: ton * 1000, answerUnit: '千克' });
  }
  for (let kg = 1; kg <= 10; kg++) {
    candidates.push({ prompt: `${kg * 1000}克 =`, answer: kg, answerUnit: '千克' });
  }
  for (let ton = 1; ton <= 10; ton++) {
    candidates.push({ prompt: `${ton * 1000}千克 =`, answer: ton, answerUnit: '吨' });
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ prompt, answer, answerUnit }, index) => (
      createPromptProblem('weight-unit', index, prompt, answer, answerUnit)
    ));
};

export const generateLengthUnitConversion = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ prompt: string; answer: number; answerUnit: string }> = [];

  for (let meter = 1; meter <= 20; meter++) {
    candidates.push({ prompt: `${meter}米 =`, answer: meter * 10, answerUnit: '分米' });
    candidates.push({ prompt: `${meter}米 =`, answer: meter * 100, answerUnit: '厘米' });
  }
  for (let decimeter = 1; decimeter <= 20; decimeter++) {
    candidates.push({ prompt: `${decimeter}分米 =`, answer: decimeter * 10, answerUnit: '厘米' });
  }
  for (let centimeter = 1; centimeter <= 20; centimeter++) {
    candidates.push({ prompt: `${centimeter}厘米 =`, answer: centimeter * 10, answerUnit: '毫米' });
  }
  for (let kilometer = 1; kilometer <= 10; kilometer++) {
    candidates.push({ prompt: `${kilometer}千米 =`, answer: kilometer * 1000, answerUnit: '米' });
  }
  for (let meter = 1; meter <= 10; meter++) {
    candidates.push({ prompt: `${meter * 100}厘米 =`, answer: meter, answerUnit: '米' });
    candidates.push({ prompt: `${meter * 1000}毫米 =`, answer: meter, answerUnit: '米' });
  }
  for (let kilometer = 1; kilometer <= 10; kilometer++) {
    candidates.push({ prompt: `${kilometer * 1000}米 =`, answer: kilometer, answerUnit: '千米' });
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ prompt, answer, answerUnit }, index) => (
    createPromptProblem('length-unit', index, prompt, answer, answerUnit)
    ));
};

export const generateTimeUnitConversion = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ prompt: string; answer: number; answerUnit: string }> = [];

  for (let hour = 1; hour <= 12; hour++) {
    candidates.push({ prompt: `${hour}时 =`, answer: hour * 60, answerUnit: '分' });
  }
  for (let minute = 1; minute <= 30; minute++) {
    candidates.push({ prompt: `${minute}分 =`, answer: minute * 60, answerUnit: '秒' });
  }
  for (let day = 1; day <= 7; day++) {
    candidates.push({ prompt: `${day}日 =`, answer: day * 24, answerUnit: '时' });
  }
  for (let hour = 1; hour <= 12; hour++) {
    candidates.push({ prompt: `${hour * 60}分 =`, answer: hour, answerUnit: '时' });
  }
  for (let minute = 1; minute <= 30; minute++) {
    candidates.push({ prompt: `${minute * 60}秒 =`, answer: minute, answerUnit: '分' });
  }
  for (let day = 1; day <= 7; day++) {
    candidates.push({ prompt: `${day * 24}时 =`, answer: day, answerUnit: '日' });
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ prompt, answer, answerUnit }, index) => (
      createPromptProblem('time-unit', index, prompt, answer, answerUnit)
    ));
};

export const generateClockReading = (config: GeneratorConfig): MathProblem[] => {
  const candidates: Array<{ hour: number; minute: number }> = [];

  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      candidates.push({ hour, minute });
    }
  }

  return shuffle(candidates)
    .slice(0, config.count)
    .map(({ hour, minute }, index) => {
      const minuteText = String(minute).padStart(2, '0');

      return {
        id: `clock-reading-${Date.now()}-${index}`,
        type: 'clock',
        a: hour,
        b: minute,
        hour,
        minute,
        operator: ':',
        answer: `${hour}:${minuteText}`,
        expression: `${hour}:${minuteText}`
      };
    });
};
