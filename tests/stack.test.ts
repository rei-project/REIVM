import { describe, test, expect } from 'bun:test';
import { Stack } from '../src/stack.ts';
import { StackOverflowError, StackUnderflowError } from '../src/errors.ts';

describe('Stack', () => {
  describe('constructor', () => {
    test('creates stack with default max depth', () => {
      const stack = new Stack();
      expect(stack.depth()).toBe(0);
    });

    test('creates stack with custom max depth', () => {
      const stack = new Stack(10);
      expect(stack.depth()).toBe(0);
    });
  });

  describe('push', () => {
    test('adds value to top of stack', () => {
      const stack = new Stack();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.depth()).toBe(1);
    });

    test('supports multiple pushes', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.depth()).toBe(3);
      expect(stack.peek()).toBe(3);
    });

    test('supports different value types', () => {
      const stack = new Stack();
      stack.push(42);
      stack.push('hello');
      stack.push(true);
      stack.push(null);
      expect(stack.depth()).toBe(4);
    });

    test('throws StackOverflowError when exceeding max depth', () => {
      const stack = new Stack(3);
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(() => stack.push(4)).toThrow(StackOverflowError);
      expect(() => stack.push(4)).toThrow('Stack overflow');
    });
  });

  describe('pop', () => {
    test('removes and returns top value', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      const value = stack.pop();
      expect(value).toBe(2);
      expect(stack.depth()).toBe(1);
    });

    test('pops in LIFO order', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
      expect(stack.depth()).toBe(0);
    });

    test('throws StackUnderflowError on empty stack', () => {
      const stack = new Stack();
      expect(() => stack.pop()).toThrow(StackUnderflowError);
      expect(() => stack.pop()).toThrow('Stack underflow');
    });

    test('throws StackUnderflowError after emptying stack', () => {
      const stack = new Stack();
      stack.push(1);
      stack.pop();
      expect(() => stack.pop()).toThrow(StackUnderflowError);
    });
  });

  describe('peek', () => {
    test('returns top value without removing it', () => {
      const stack = new Stack();
      stack.push(42);
      const value = stack.peek();
      expect(value).toBe(42);
      expect(stack.depth()).toBe(1);
      expect(stack.peek()).toBe(42); // Still there
    });

    test('throws StackUnderflowError on empty stack', () => {
      const stack = new Stack();
      expect(() => stack.peek()).toThrow(StackUnderflowError);
    });

    test('returns most recent value after multiple pushes', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.peek()).toBe(3);
    });
  });

  describe('depth', () => {
    test('returns 0 for empty stack', () => {
      const stack = new Stack();
      expect(stack.depth()).toBe(0);
    });

    test('returns correct count after pushes', () => {
      const stack = new Stack();
      expect(stack.depth()).toBe(0);
      stack.push(1);
      expect(stack.depth()).toBe(1);
      stack.push(2);
      expect(stack.depth()).toBe(2);
      stack.push(3);
      expect(stack.depth()).toBe(3);
    });

    test('returns correct count after pops', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.depth()).toBe(3);
      stack.pop();
      expect(stack.depth()).toBe(2);
      stack.pop();
      expect(stack.depth()).toBe(1);
    });
  });

  describe('clear', () => {
    test('removes all items from stack', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.clear();
      expect(stack.depth()).toBe(0);
    });

    test('allows push after clear', () => {
      const stack = new Stack();
      stack.push(1);
      stack.clear();
      stack.push(2);
      expect(stack.depth()).toBe(1);
      expect(stack.peek()).toBe(2);
    });

    test('works on empty stack', () => {
      const stack = new Stack();
      stack.clear();
      expect(stack.depth()).toBe(0);
    });
  });

  describe('snapshot', () => {
    test('returns copy of stack contents', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const snapshot = stack.snapshot();
      expect(snapshot).toEqual([1, 2, 3]);
    });

    test('returns independent copy', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      const snapshot = stack.snapshot();
      snapshot[0] = 99;
      expect(stack.snapshot()).toEqual([1, 2]);
    });

    test('returns empty array for empty stack', () => {
      const stack = new Stack();
      expect(stack.snapshot()).toEqual([]);
    });

    test('returns bottom-to-top order', () => {
      const stack = new Stack();
      stack.push('first');
      stack.push('second');
      stack.push('third');
      const snapshot = stack.snapshot();
      expect(snapshot[0]).toBe('first');
      expect(snapshot[1]).toBe('second');
      expect(snapshot[2]).toBe('third');
    });
  });

  describe('edge cases', () => {
    test('handles max depth of 1', () => {
      const stack = new Stack(1);
      stack.push(42);
      expect(() => stack.push(99)).toThrow(StackOverflowError);
      expect(stack.pop()).toBe(42);
      stack.push(99);
      expect(stack.peek()).toBe(99);
    });

    test('handles large max depth', () => {
      const stack = new Stack(1000);
      for (let i = 0; i < 1000; i++) {
        stack.push(i);
      }
      expect(stack.depth()).toBe(1000);
      expect(() => stack.push(1000)).toThrow(StackOverflowError);
    });
  });
});
