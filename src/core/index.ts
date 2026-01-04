/**
 * Core words for REIVM.
 *
 * This module collects and exports all CORE words that are bootstrapped
 * into every VM instance. These words are protected and cannot be redefined.
 */

import { stackOps } from './stack-ops.js';
import { arithmeticOps } from './arithmetic.js';
import { stringOps } from './strings.js';
import { consoleOps } from './console.js';
import { domOps } from './dom.js';
import type { Word } from '../word.js';

/**
 * All CORE words available in REIVM.
 *
 * These words are automatically loaded by bootstrapVM() and are marked
 * as protected, meaning they cannot be redefined or forgotten.
 */
export const CoreWords: Word[] = [
  ...stackOps,
  ...arithmeticOps,
  ...stringOps,
  ...consoleOps,
  ...domOps,
];

export default CoreWords;

// Re-export individual word modules for direct access
export * from './stack-ops.js';
export * from './arithmetic.js';
export * from './strings.js';
export * from './console.js';
export * from './dom.js';
