import { Stack } from './stack.js';
import { Dictionary } from './dictionary.js';
import { WordNotFoundError } from './errors.js';
import type { Word, StackValue, WordMetadata } from './word.js';

/**
 * VM configuration options.
 */
export interface VMConfig {
  /** Maximum data stack depth (default: 256) */
  stackDepth?: number;
  /** Maximum return stack depth (default: 256) */
  returnStackDepth?: number;
}

/**
 * The REI Virtual Machine.
 *
 * Coordinates the data stack, return stack, and dictionary to execute words.
 * This is the main execution engine for REI code.
 */
export class VM {
  /** Data stack for computation */
  public dataStack: Stack;

  /** Return stack for control flow */
  public returnStack: Stack;

  /** Dictionary of word definitions */
  public dictionary: Dictionary;

  /** Whether to record execution trace */
  public tracing: boolean = false;

  /** Execution trace (when tracing enabled) */
  public trace: unknown[] = [];

  private config: VMConfig;

  /**
   * Creates a new VM instance.
   *
   * @param config - Optional configuration
   *
   * @example
   * ```typescript
   * const vm = new VM();
   * const vm = new VM({ stackDepth: 1024 });
   * ```
   */
  constructor(config?: VMConfig) {
    this.config = config ?? {};
    this.dataStack = new Stack(config?.stackDepth ?? 256);
    this.returnStack = new Stack(config?.returnStackDepth ?? 256);
    this.dictionary = new Dictionary();
  }

  /**
   * Parse a code string into tokens.
   *
   * Splits on whitespace and filters out empty tokens.
   *
   * @param code - REI code string
   * @returns Array of tokens
   *
   * @example
   * ```typescript
   * vm.parse('5 3 + DUP *'); // ['5', '3', '+', 'DUP', '*']
   * ```
   */
  parse(code: string): string[] {
    return code.trim().split(/\s+/).filter((token) => token.length > 0);
  }

  /**
   * Execute a single word.
   *
   * If the word is a string, looks it up in the dictionary.
   * If the word is a Word object, executes it directly.
   * If the word body is a function, calls it.
   * If the word body is an array of word names, executes each recursively.
   *
   * @param wordOrName - Word object or word name to execute
   * @throws {WordNotFoundError} If word name not found in dictionary
   *
   * @example
   * ```typescript
   * vm.execute('DUP');
   * vm.execute(myWord);
   * ```
   */
  execute(wordOrName: Word | string): void {
    let word: Word;

    if (typeof wordOrName === 'string') {
      const found = this.dictionary.find(wordOrName);
      if (!found) {
        throw new WordNotFoundError(wordOrName);
      }
      word = found;
    } else {
      word = wordOrName;
    }

    // Execute the word body
    if (typeof word.body === 'function') {
      // Native word: execute function
      word.body(this);
    } else {
      // Compiled word: execute each token in the array
      for (const token of word.body) {
        // Check if token is a numeric literal
        const num = Number(token);
        if (!isNaN(num)) {
          this.dataStack.push(num);
        } else {
          // Execute as word
          this.execute(token);
        }
      }
    }
  }

  /**
   * Parse and execute a code string.
   *
   * Parses the code into tokens, then executes each token.
   * Numeric literals are pushed onto the data stack.
   * Other tokens are looked up as words and executed.
   *
   * @param code - REI code string
   *
   * @example
   * ```typescript
   * vm.run('5 3 +');        // Push 5, push 3, add
   * vm.run('DUP * SWAP');   // Duplicate, multiply, swap
   * ```
   */
  run(code: string): void {
    const tokens = this.parse(code);

    for (const token of tokens) {
      // Try to parse as number
      const num = Number(token);
      if (!isNaN(num)) {
        this.dataStack.push(num);
      } else {
        // Execute as word
        this.execute(token);
      }
    }
  }

  /**
   * Serialize the VM state to a plain object.
   *
   * Captures stack contents, user-defined words, and configuration.
   * Does NOT include CORE words (they are bootstrapped from code).
   *
   * @returns Serialized VM state
   *
   * @example
   * ```typescript
   * const state = vm.serialize();
   * localStorage.setItem('session', JSON.stringify(state));
   * ```
   */
  serialize(): VMState {
    // Get all USER words (CORE words are not serialized)
    const userWords = this.dictionary.list('USER');
    const serializedWords: SerializedWord[] = userWords.map((name) => {
      const word = this.dictionary.find(name)!;
      return {
        name: word.name,
        stackEffect: word.stackEffect,
        body: typeof word.body === 'function' ? '__NATIVE__' : JSON.stringify(word.body),
        immediate: word.immediate,
        metadata: word.metadata,
      };
    });

    return {
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      stack: this.dataStack.snapshot(),
      dictionary: serializedWords,
      config: this.config,
    };
  }

  /**
   * Restore VM state from a serialized object.
   *
   * Clears current stack and USER words, then restores from state.
   * CORE words must be loaded separately via bootstrap.
   *
   * @param state - Serialized VM state
   *
   * @example
   * ```typescript
   * const state = JSON.parse(localStorage.getItem('session'));
   * vm.deserialize(state);
   * ```
   */
  deserialize(state: VMState): void {
    // Clear data stack and restore
    this.dataStack.clear();
    for (const value of state.stack) {
      this.dataStack.push(value);
    }

    // Restore USER words (CORE words should already be loaded)
    for (const serializedWord of state.dictionary) {
      // Skip if word body is native (can't deserialize functions)
      if (serializedWord.body === '__NATIVE__') {
        continue;
      }

      const body = JSON.parse(serializedWord.body) as string[];
      this.dictionary.define(serializedWord.name, {
        stackEffect: serializedWord.stackEffect,
        body,
        immediate: serializedWord.immediate,
        protected: false,
        category: 'USER',
        metadata: serializedWord.metadata,
      });
    }
  }

  /**
   * Create an independent copy of this VM.
   *
   * Uses serialize/deserialize to create a deep copy.
   * Changes to the clone will not affect the original.
   *
   * @returns A new VM instance with copied state
   *
   * @example
   * ```typescript
   * const vm1 = bootstrapVM();
   * vm1.run('5 3 +');
   *
   * const vm2 = vm1.clone();
   * vm2.run('DUP *'); // Square it
   *
   * console.log(vm1.dataStack.peek()); // 8 (original)
   * console.log(vm2.dataStack.peek()); // 64 (cloned)
   * ```
   */
  clone(): VM {
    const newVM = new VM(this.config);

    // Copy dictionary words (including CORE)
    const allWords = this.dictionary.list();
    for (const name of allWords) {
      const word = this.dictionary.find(name)!;
      newVM.dictionary.define(name, word);
    }

    // Copy data stack
    const stackContents = this.dataStack.snapshot();
    for (const value of stackContents) {
      newVM.dataStack.push(value);
    }

    // Copy return stack
    const returnStackContents = this.returnStack.snapshot();
    for (const value of returnStackContents) {
      newVM.returnStack.push(value);
    }

    return newVM;
  }
}

/**
 * Serialized VM state for persistence.
 */
export interface VMState {
  version: string;
  timestamp: string;
  stack: StackValue[];
  dictionary: SerializedWord[];
  config: VMConfig;
}

/**
 * Serialized word definition.
 */
export interface SerializedWord {
  name: string;
  stackEffect: string;
  body: string; // JSON string or '__NATIVE__'
  immediate: boolean;
  metadata: WordMetadata;
}
