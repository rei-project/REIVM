import { StackOverflowError, StackUnderflowError } from './errors.js';
import type { StackValue } from './word.js';

/**
 * Array-backed stack with bounds checking.
 *
 * The stack is the primary data structure in REI. All computation flows through it.
 * Provides a simple LIFO (Last In First Out) data structure with overflow protection.
 */
export class Stack {
  private items: StackValue[] = [];
  private readonly maxDepth: number;

  /**
   * Creates a new stack.
   *
   * @param maxDepth - Maximum stack depth (default: 256)
   *
   * @example
   * ```typescript
   * const stack = new Stack();        // Default max depth 256
   * const stack = new Stack(1024);    // Custom max depth
   * ```
   */
  constructor(maxDepth: number = 256) {
    this.maxDepth = maxDepth;
  }

  /**
   * Pushes a value onto the top of the stack.
   *
   * @param value - Value to push
   * @throws {StackOverflowError} If stack is at maximum depth
   *
   * @example
   * ```typescript
   * stack.push(42);
   * stack.push('hello');
   * ```
   */
  push(value: StackValue): void {
    if (this.items.length >= this.maxDepth) {
      throw new StackOverflowError();
    }
    this.items.push(value);
  }

  /**
   * Removes and returns the top value from the stack.
   *
   * @returns The top value
   * @throws {StackUnderflowError} If stack is empty
   *
   * @example
   * ```typescript
   * stack.push(1);
   * stack.push(2);
   * const value = stack.pop(); // Returns 2
   * ```
   */
  pop(): StackValue {
    if (this.items.length === 0) {
      throw new StackUnderflowError();
    }
    return this.items.pop()!;
  }

  /**
   * Returns the top value without removing it.
   *
   * @returns The top value
   * @throws {StackUnderflowError} If stack is empty
   *
   * @example
   * ```typescript
   * stack.push(42);
   * const value = stack.peek(); // Returns 42, stack still has 42
   * ```
   */
  peek(): StackValue {
    if (this.items.length === 0) {
      throw new StackUnderflowError();
    }
    return this.items[this.items.length - 1]!;
  }

  /**
   * Returns the current number of items on the stack.
   *
   * @returns Stack depth
   *
   * @example
   * ```typescript
   * stack.push(1);
   * stack.push(2);
   * console.log(stack.depth()); // 2
   * ```
   */
  depth(): number {
    return this.items.length;
  }

  /**
   * Removes all items from the stack.
   *
   * @example
   * ```typescript
   * stack.push(1);
   * stack.push(2);
   * stack.clear();
   * console.log(stack.depth()); // 0
   * ```
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Returns a copy of the current stack contents.
   * The returned array is independent of the internal stack state.
   *
   * @returns Copy of stack items (bottom to top)
   *
   * @example
   * ```typescript
   * stack.push(1);
   * stack.push(2);
   * const snapshot = stack.snapshot(); // [1, 2]
   * snapshot[0] = 99; // Does not affect stack
   * ```
   */
  snapshot(): StackValue[] {
    return [...this.items];
  }
}
