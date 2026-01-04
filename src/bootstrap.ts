/**
 * Bootstrap function for creating a VM with CORE words loaded.
 *
 * This is the standard way to create a REIVM instance.
 * All CORE words are automatically loaded and ready to use.
 */

import { VM, type VMConfig } from './vm.js';
import CoreWords from './core/index.js';

/**
 * Create a new VM instance with CORE words loaded.
 *
 * This is the recommended way to create a VM for normal use.
 * All stack operations, arithmetic, and comparison words are pre-loaded.
 *
 * @param config - Optional VM configuration
 * @returns A VM instance with CORE words loaded
 *
 * @example
 * ```typescript
 * const vm = bootstrapVM();
 * vm.run('5 3 +');
 * console.log(vm.dataStack.peek()); // 8
 * ```
 *
 * @example
 * ```typescript
 * const vm = bootstrapVM({ stackDepth: 1024 });
 * vm.run('DUP SWAP DROP');
 * ```
 */
export function bootstrapVM(config?: VMConfig): VM {
  const vm = new VM(config);

  // Load all CORE words into the dictionary
  for (const word of CoreWords) {
    vm.dictionary.define(word.name, word);
  }

  return vm;
}
