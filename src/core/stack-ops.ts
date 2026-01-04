import type { Word } from '../word.js';
import type { VM } from '../vm.js';

/**
 * DUP - Duplicate top stack value
 * Stack effect: ( n -- n n )
 */
export const DUP: Word = {
  name: 'DUP',
  stackEffect: '( n -- n n )',
  body: (vm: VM) => {
    const value = vm.dataStack.peek();
    vm.dataStack.push(value);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Duplicate the top stack value',
  },
};

/**
 * DROP - Remove top stack value
 * Stack effect: ( n -- )
 */
export const DROP: Word = {
  name: 'DROP',
  stackEffect: '( n -- )',
  body: (vm: VM) => {
    vm.dataStack.pop();
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Remove the top stack value',
  },
};

/**
 * SWAP - Swap top two stack values
 * Stack effect: ( a b -- b a )
 */
export const SWAP: Word = {
  name: 'SWAP',
  stackEffect: '( a b -- b a )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop();
    const a = vm.dataStack.pop();
    vm.dataStack.push(b);
    vm.dataStack.push(a);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Swap the top two stack values',
  },
};

/**
 * OVER - Copy second stack value to top
 * Stack effect: ( a b -- a b a )
 */
export const OVER: Word = {
  name: 'OVER',
  stackEffect: '( a b -- a b a )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop();
    const a = vm.dataStack.peek();
    vm.dataStack.push(b);
    vm.dataStack.push(a);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Copy the second stack value to the top',
  },
};

/**
 * ROT - Rotate top three stack values
 * Stack effect: ( a b c -- b c a )
 */
export const ROT: Word = {
  name: 'ROT',
  stackEffect: '( a b c -- b c a )',
  body: (vm: VM) => {
    const c = vm.dataStack.pop();
    const b = vm.dataStack.pop();
    const a = vm.dataStack.pop();
    vm.dataStack.push(b);
    vm.dataStack.push(c);
    vm.dataStack.push(a);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Rotate the top three stack values',
  },
};

/**
 * 2DUP - Duplicate top two stack values
 * Stack effect: ( a b -- a b a b )
 */
export const TWODUP: Word = {
  name: '2DUP',
  stackEffect: '( a b -- a b a b )',
  body: (vm: VM) => {
    const b = vm.dataStack.pop();
    const a = vm.dataStack.pop();
    vm.dataStack.push(a);
    vm.dataStack.push(b);
    vm.dataStack.push(a);
    vm.dataStack.push(b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Duplicate the top two stack values',
  },
};

/**
 * 2DROP - Remove top two stack values
 * Stack effect: ( a b -- )
 */
export const TWODROP: Word = {
  name: '2DROP',
  stackEffect: '( a b -- )',
  body: (vm: VM) => {
    vm.dataStack.pop();
    vm.dataStack.pop();
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Remove the top two stack values',
  },
};

/**
 * 2SWAP - Swap top two pairs of stack values
 * Stack effect: ( a b c d -- c d a b )
 */
export const TWOSWAP: Word = {
  name: '2SWAP',
  stackEffect: '( a b c d -- c d a b )',
  body: (vm: VM) => {
    const d = vm.dataStack.pop();
    const c = vm.dataStack.pop();
    const b = vm.dataStack.pop();
    const a = vm.dataStack.pop();
    vm.dataStack.push(c);
    vm.dataStack.push(d);
    vm.dataStack.push(a);
    vm.dataStack.push(b);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Swap the top two pairs of stack values',
  },
};

/** All stack operation words */
export const stackOps = [DUP, DROP, SWAP, OVER, ROT, TWODUP, TWODROP, TWOSWAP];
