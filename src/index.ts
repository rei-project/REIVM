/**
 * REIVM - REI Virtual Machine
 *
 * A stack-based virtual machine implementing Forth-like semantics.
 * This is the main entry point for the REIVM library.
 *
 * @example
 * ```typescript
 * import { bootstrapVM } from '@rei-project/reivm';
 *
 * const vm = bootstrapVM();
 * vm.run('5 3 + DUP *'); // (5+3)² = 64
 * console.log(vm.dataStack.pop()); // 64
 * ```
 */

// Main exports
export { VM, type VMConfig, type VMState, type SerializedWord } from './vm.js';
export { Stack } from './stack.js';
export { Dictionary, type WordCategory } from './dictionary.js';
export { bootstrapVM } from './bootstrap.js';

// Type definitions
export type { Word, WordBody, WordMetadata, StackValue } from './word.js';

// Error classes
export {
  REIError,
  StackOverflowError,
  StackUnderflowError,
  WordNotFoundError,
  ControlFlowError,
} from './errors.js';

// Core words (optional, for advanced use)
export { default as CoreWords } from './core/index.js';
