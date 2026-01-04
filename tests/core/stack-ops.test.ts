import { describe, test, expect } from 'bun:test';
import { VM } from '../../src/vm.ts';
import { DUP, DROP, SWAP, OVER, ROT, TWODUP, TWODROP, TWOSWAP } from '../../src/core/stack-ops.ts';

describe('Stack Operations', () => {
  describe('DUP', () => {
    test('duplicates top value', () => {
      const vm = new VM();
      vm.dataStack.push(42);
      (DUP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(2);
      expect(vm.dataStack.pop()).toBe(42);
      expect(vm.dataStack.pop()).toBe(42);
    });

    test('works with different types', () => {
      const vm = new VM();
      vm.dataStack.push('hello');
      (DUP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(2);
      expect(vm.dataStack.pop()).toBe('hello');
      expect(vm.dataStack.pop()).toBe('hello');
    });

    test('throws on empty stack', () => {
      const vm = new VM();
      expect(() => (DUP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('DROP', () => {
    test('removes top value', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      (DROP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(1);
    });

    test('throws on empty stack', () => {
      const vm = new VM();
      expect(() => (DROP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('SWAP', () => {
    test('swaps top two values', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      (SWAP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(2);
      expect(vm.dataStack.pop()).toBe(1);
      expect(vm.dataStack.pop()).toBe(2);
    });

    test('works with different types', () => {
      const vm = new VM();
      vm.dataStack.push('first');
      vm.dataStack.push('second');
      (SWAP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.pop()).toBe('first');
      expect(vm.dataStack.pop()).toBe('second');
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (SWAP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('OVER', () => {
    test('copies second value to top', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      (OVER.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(3);
      expect(vm.dataStack.pop()).toBe(1);
      expect(vm.dataStack.pop()).toBe(2);
      expect(vm.dataStack.pop()).toBe(1);
    });

    test('does not modify second value', () => {
      const vm = new VM();
      vm.dataStack.push('a');
      vm.dataStack.push('b');
      (OVER.body as (vm: VM) => void)(vm);
      const snapshot = vm.dataStack.snapshot();
      expect(snapshot).toEqual(['a', 'b', 'a']);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (OVER.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('ROT', () => {
    test('rotates top three values', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      vm.dataStack.push(3);
      (ROT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(3);
      expect(vm.dataStack.pop()).toBe(1);
      expect(vm.dataStack.pop()).toBe(3);
      expect(vm.dataStack.pop()).toBe(2);
    });

    test('maintains correct order', () => {
      const vm = new VM();
      vm.dataStack.push('a');
      vm.dataStack.push('b');
      vm.dataStack.push('c');
      (ROT.body as (vm: VM) => void)(vm);
      const snapshot = vm.dataStack.snapshot();
      expect(snapshot).toEqual(['b', 'c', 'a']);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      expect(() => (ROT.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('2DUP', () => {
    test('duplicates top two values', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      (TWODUP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(4);
      const snapshot = vm.dataStack.snapshot();
      expect(snapshot).toEqual([1, 2, 1, 2]);
    });

    test('preserves order', () => {
      const vm = new VM();
      vm.dataStack.push('a');
      vm.dataStack.push('b');
      (TWODUP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.pop()).toBe('b');
      expect(vm.dataStack.pop()).toBe('a');
      expect(vm.dataStack.pop()).toBe('b');
      expect(vm.dataStack.pop()).toBe('a');
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (TWODUP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('2DROP', () => {
    test('removes top two values', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      vm.dataStack.push(3);
      (TWODROP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(1);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (TWODROP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('2SWAP', () => {
    test('swaps top two pairs', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      vm.dataStack.push(3);
      vm.dataStack.push(4);
      (TWOSWAP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(4);
      const snapshot = vm.dataStack.snapshot();
      expect(snapshot).toEqual([3, 4, 1, 2]);
    });

    test('preserves pair order', () => {
      const vm = new VM();
      vm.dataStack.push('a');
      vm.dataStack.push('b');
      vm.dataStack.push('c');
      vm.dataStack.push('d');
      (TWOSWAP.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.pop()).toBe('b');
      expect(vm.dataStack.pop()).toBe('a');
      expect(vm.dataStack.pop()).toBe('d');
      expect(vm.dataStack.pop()).toBe('c');
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      vm.dataStack.push(3);
      expect(() => (TWOSWAP.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('word metadata', () => {
    test('all words are protected', () => {
      expect(DUP.protected).toBe(true);
      expect(DROP.protected).toBe(true);
      expect(SWAP.protected).toBe(true);
      expect(OVER.protected).toBe(true);
      expect(ROT.protected).toBe(true);
      expect(TWODUP.protected).toBe(true);
      expect(TWODROP.protected).toBe(true);
      expect(TWOSWAP.protected).toBe(true);
    });

    test('all words are CORE category', () => {
      expect(DUP.category).toBe('CORE');
      expect(DROP.category).toBe('CORE');
      expect(SWAP.category).toBe('CORE');
      expect(OVER.category).toBe('CORE');
      expect(ROT.category).toBe('CORE');
      expect(TWODUP.category).toBe('CORE');
      expect(TWODROP.category).toBe('CORE');
      expect(TWOSWAP.category).toBe('CORE');
    });

    test('all words have stack effects', () => {
      expect(DUP.stackEffect).toBe('( n -- n n )');
      expect(DROP.stackEffect).toBe('( n -- )');
      expect(SWAP.stackEffect).toBe('( a b -- b a )');
      expect(OVER.stackEffect).toBe('( a b -- a b a )');
      expect(ROT.stackEffect).toBe('( a b c -- b c a )');
      expect(TWODUP.stackEffect).toBe('( a b -- a b a b )');
      expect(TWODROP.stackEffect).toBe('( a b -- )');
      expect(TWOSWAP.stackEffect).toBe('( a b c d -- c d a b )');
    });
  });
});
