import type { Word, WordMetadata } from './word.js';

export type WordCategory = 'CORE' | 'STANDARD' | 'USER';

/**
 * Dictionary stores and manages word definitions.
 *
 * Uses a Map for O(1) lookup and maintains insertion order.
 * Protected words (CORE) cannot be redefined or forgotten.
 * Previous definitions are stored when words are redefined.
 */
export class Dictionary {
  private words: Map<string, Word> = new Map();
  private definitionOrder: string[] = [];

  /**
   * Creates a new empty dictionary.
   */
  constructor() {
    this.words = new Map();
    this.definitionOrder = [];
  }

  /**
   * Defines a new word or redefines an existing one.
   *
   * If the word already exists and is not protected, stores the previous
   * definition in metadata before replacing it.
   *
   * @param name - Word name (will be used as-is, case-sensitive)
   * @param word - Partial word definition (name will be set from parameter)
   * @throws {Error} If attempting to redefine a protected word
   *
   * @example
   * ```typescript
   * dict.define('DUP', {
   *   stackEffect: '( n -- n n )',
   *   body: (vm) => { vm.dataStack.push(vm.dataStack.peek()); },
   *   immediate: false,
   *   protected: true,
   *   category: 'CORE',
   *   metadata: { defined: new Date(), usageCount: 0 }
   * });
   * ```
   */
  define(name: string, word: Partial<Word>): void {
    const existing = this.words.get(name);

    // Check if trying to redefine a protected word
    if (existing?.protected) {
      throw new Error(`Cannot redefine protected word: ${name}`);
    }

    // Build complete word definition
    const completeWord: Word = {
      name,
      stackEffect: word.stackEffect ?? '( -- )',
      body: word.body ?? [],
      immediate: word.immediate ?? false,
      protected: word.protected ?? false,
      category: word.category ?? 'USER',
      metadata: word.metadata ?? {
        defined: new Date(),
        usageCount: 0,
      },
    };

    // If redefining, store previous definition
    if (existing) {
      if (!completeWord.metadata.previousDefinitions) {
        completeWord.metadata.previousDefinitions = [];
      }
      completeWord.metadata.previousDefinitions.push({
        timestamp: new Date(),
        definition: existing,
      });
    } else {
      // New word, add to order list
      this.definitionOrder.push(name);
    }

    this.words.set(name, completeWord);
  }

  /**
   * Finds a word by name.
   *
   * @param name - Word name to search for
   * @returns The word definition, or null if not found
   *
   * @example
   * ```typescript
   * const word = dict.find('DUP');
   * if (word) {
   *   console.log(word.stackEffect);
   * }
   * ```
   */
  find(name: string): Word | null {
    return this.words.get(name) ?? null;
  }

  /**
   * Removes a word from the dictionary.
   *
   * @param name - Word name to remove
   * @throws {Error} If attempting to forget a protected word
   * @throws {Error} If word does not exist
   *
   * @example
   * ```typescript
   * dict.forget('MY-WORD');
   * ```
   */
  forget(name: string): void {
    const word = this.words.get(name);

    if (!word) {
      throw new Error(`Cannot forget unknown word: ${name}`);
    }

    if (word.protected) {
      throw new Error(`Cannot forget protected word: ${name}`);
    }

    this.words.delete(name);
    const index = this.definitionOrder.indexOf(name);
    if (index !== -1) {
      this.definitionOrder.splice(index, 1);
    }
  }

  /**
   * Lists all words, optionally filtered by category.
   *
   * Returns words in definition order.
   *
   * @param filter - Optional category filter
   * @returns Array of word names
   *
   * @example
   * ```typescript
   * dict.list();           // All words
   * dict.list('CORE');     // Only CORE words
   * dict.list('USER');     // Only USER words
   * ```
   */
  list(filter?: WordCategory): string[] {
    if (!filter) {
      return [...this.definitionOrder];
    }

    return this.definitionOrder.filter((name) => {
      const word = this.words.get(name);
      return word?.category === filter;
    });
  }
}
