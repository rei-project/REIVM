import { Stack } from './stack.js';
import { Dictionary } from './dictionary.js';

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
}
