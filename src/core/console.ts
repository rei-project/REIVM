import type { Word } from '../word.js';
import type { VM } from '../vm.js';

/**
 * . - Print top of stack with newline
 * Stack effect: ( value -- ) [prints]
 *
 * Works with any type (numbers, strings, objects, etc.)
 */
export const PRINT: Word = {
  name: '.',
  stackEffect: '( value -- ) [prints]',
  body: (vm: VM) => {
    const value = vm.dataStack.pop();
    console.log(value);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Print top of stack with newline. Works with any type (numbers, strings, objects, etc.)',
  },
};

/**
 * EMIT - Print single character from character code
 * Stack effect: ( char-code -- ) [prints]
 *
 * Note: Uses process.stdout.write in Node/Bun environments
 */
export const EMIT: Word = {
  name: 'EMIT',
  stackEffect: '( char-code -- ) [prints]',
  body: (vm: VM) => {
    const code = vm.dataStack.pop() as number;
    // Use process.stdout.write if available (Node/Bun), otherwise use console.log
    if (typeof process !== 'undefined' && process.stdout) {
      process.stdout.write(String.fromCharCode(code));
    } else {
      // Browser fallback - use console.log without newline isn't possible,
      // but this provides basic functionality
      console.log(String.fromCharCode(code));
    }
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Print single character from character code',
  },
};

/** All console I/O words */
export const consoleOps = [PRINT, EMIT];
