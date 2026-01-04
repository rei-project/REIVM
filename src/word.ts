/**
 * Type definitions for REIVM words and stack values.
 *
 * A "word" is the fundamental unit of execution in REI.
 * Words can be either native (implemented as functions) or compiled (arrays of other words).
 */

import type { VM } from './vm.js';

/**
 * Stack values can be any JavaScript value.
 * In practice, most operations work with numbers, but REI supports
 * strings, booleans, objects, and null/undefined for flexibility.
 */
export type StackValue = number | string | boolean | object | null | undefined;

/**
 * Word body is either:
 * - A native function that operates on the VM
 * - An array of word names to execute (compiled word)
 */
export type WordBody = string[] | ((vm: VM) => void);

/**
 * Metadata tracked for each word.
 * Provides introspection capabilities and history tracking.
 */
export interface WordMetadata {
  /** When this word was defined */
  defined: Date;

  /** How many times this word has been executed (optional tracking) */
  usageCount: number;

  /** Previous definitions when word is redefined */
  previousDefinitions?: Array<{
    timestamp: Date;
    definition: Word;
  }>;

  /** Optional human-readable documentation */
  documentation?: string;
}

/**
 * Complete word definition.
 * Every word in the dictionary has this structure.
 */
export interface Word {
  /** Word identifier (uppercase by convention) */
  name: string;

  /** Stack effect notation ( before -- after ) */
  stackEffect: string;

  /** Implementation (native function or compiled word list) */
  body: WordBody;

  /** If true, execute during compilation instead of runtime */
  immediate: boolean;

  /** If true, word cannot be redefined or forgotten */
  protected: boolean;

  /** Category for organization and filtering */
  category: 'CORE' | 'STANDARD' | 'USER';

  /** Additional metadata for introspection */
  metadata: WordMetadata;
}
