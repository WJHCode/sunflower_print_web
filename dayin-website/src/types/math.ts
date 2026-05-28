export type MathProblemType = 'basic' | 'split-tree' | 'make-ten' | 'vertical' | 'conversion';

export interface SplitNodes {
  main: number;
  left: number;
  right: number;
  isLeftBreak: boolean; // whether the left node is the '10' (break ten)
}

export interface ExchangePart {
  count: number;
  unit: string;
}

export interface MathProblem {
  id: string;
  type: MathProblemType;
  expression: string; // for screen readers or debug
  a: number;
  b: number;
  c?: number;
  operator: string;
  operator2?: string;
  answer: number | string;
  prompt?: string;
  answerUnit?: string;
  exchangeParts?: ExchangePart[];
  splitNodes?: SplitNodes;
}

export interface GeneratorConfig {
  maxNumber: number;
  count: number;
}
