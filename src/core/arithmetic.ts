import type { Word } from '../word.js';
import type { VM } from '../vm.js';

/**
 * + - Add two numbers
 * Stack effect: ( a b -- sum )
 */
export const ADD: Word = {
  name: '+',
  stackEffect: '( a b -- sum )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a + b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Add two numbers',
  },
};

/**
 * - - Subtract two numbers
 * Stack effect: ( a b -- difference )
 */
export const SUB: Word = {
  name: '-',
  stackEffect: '( a b -- difference )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a - b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Subtract b from a',
  },
};

/**
 * * - Multiply two numbers
 * Stack effect: ( a b -- product )
 */
export const MUL: Word = {
  name: '*',
  stackEffect: '( a b -- product )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a * b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Multiply two numbers',
  },
};

/**
 * / - Divide two numbers
 * Stack effect: ( a b -- quotient )
 */
export const DIV: Word = {
  name: '/',
  stackEffect: '( a b -- quotient )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a / b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Divide a by b',
  },
};

/**
 * MOD - Modulo operation
 * Stack effect: ( a b -- remainder )
 */
export const MOD: Word = {
  name: 'MOD',
  stackEffect: '( a b -- remainder )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a % b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Calculate remainder of a divided by b',
  },
};

/**
 * = - Test equality
 * Stack effect: ( a b -- bool )
 */
export const EQ: Word = {
  name: '=',
  stackEffect: '( a b -- bool )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop();
    const a = vm.dataStack.pop();
    vm.dataStack.push(a === b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Test if two values are equal',
  },
};

/**
 * < - Test less than
 * Stack effect: ( a b -- bool )
 */
export const LT: Word = {
  name: '<',
  stackEffect: '( a b -- bool )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a < b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Test if a is less than b',
  },
};

/**
 * > - Test greater than
 * Stack effect: ( a b -- bool )
 */
export const GT: Word = {
  name: '>',
  stackEffect: '( a b -- bool )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a > b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Test if a is greater than b',
  },
};

/**
 * <= - Test less than or equal
 * Stack effect: ( a b -- bool )
 */
export const LTE: Word = {
  name: '<=',
  stackEffect: '( a b -- bool )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a <= b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Test if a is less than or equal to b',
  },
};

/**
 * >= - Test greater than or equal
 * Stack effect: ( a b -- bool )
 */
export const GTE: Word = {
  name: '>=',
  stackEffect: '( a b -- bool )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop() as number;
    const a = vm.dataStack.pop() as number;
    vm.dataStack.push(a >= b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Test if a is greater than or equal to b',
  },
};

/** All arithmetic and comparison words */
export const arithmeticOps = [ADD, SUB, MUL, DIV, MOD, EQ, LT, GT, LTE, GTE];
