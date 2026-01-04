import { describe, test, expect } from 'bun:test';
import { VM } from '../../src/vm.ts';
import { ADD, SUB, MUL, DIV, MOD, EQ, LT, GT, LTE, GTE } from '../../src/core/arithmetic.ts';

describe('Arithmetic Operations', () => {
  describe('ADD (+)', () => {
    test('adds two positive numbers', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (ADD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(8);
    });

    test('adds negative numbers', () => {
      const vm = new VM();
      vm.dataStack.push(-5);
      vm.dataStack.push(3);
      (ADD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(-2);
    });

    test('adds zero', () => {
      const vm = new VM();
      vm.dataStack.push(42);
      vm.dataStack.push(0);
      (ADD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(42);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (ADD.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('SUB (-)', () => {
    test('subtracts two positive numbers', () => {
      const vm = new VM();
      vm.dataStack.push(10);
      vm.dataStack.push(3);
      (SUB.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(7);
    });

    test('subtracts negative numbers', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(-3);
      (SUB.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(8);
    });

    test('results in negative', () => {
      const vm = new VM();
      vm.dataStack.push(3);
      vm.dataStack.push(10);
      (SUB.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(-7);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (SUB.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('MUL (*)', () => {
    test('multiplies two positive numbers', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (MUL.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(15);
    });

    test('multiplies by zero', () => {
      const vm = new VM();
      vm.dataStack.push(42);
      vm.dataStack.push(0);
      (MUL.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(0);
    });

    test('multiplies negative numbers', () => {
      const vm = new VM();
      vm.dataStack.push(-5);
      vm.dataStack.push(-3);
      (MUL.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(15);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (MUL.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('DIV (/)', () => {
    test('divides two positive numbers', () => {
      const vm = new VM();
      vm.dataStack.push(15);
      vm.dataStack.push(3);
      (DIV.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(5);
    });

    test('handles division with remainder', () => {
      const vm = new VM();
      vm.dataStack.push(10);
      vm.dataStack.push(3);
      (DIV.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBeCloseTo(3.333, 2);
    });

    test('divides negative numbers', () => {
      const vm = new VM();
      vm.dataStack.push(-15);
      vm.dataStack.push(3);
      (DIV.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(-5);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (DIV.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('MOD', () => {
    test('calculates modulo', () => {
      const vm = new VM();
      vm.dataStack.push(10);
      vm.dataStack.push(3);
      (MOD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(1);
    });

    test('handles even division', () => {
      const vm = new VM();
      vm.dataStack.push(15);
      vm.dataStack.push(5);
      (MOD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(0);
    });

    test('handles negative numbers', () => {
      const vm = new VM();
      vm.dataStack.push(-10);
      vm.dataStack.push(3);
      (MOD.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(-1);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (MOD.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('EQ (=)', () => {
    test('returns true for equal numbers', () => {
      const vm = new VM();
      vm.dataStack.push(42);
      vm.dataStack.push(42);
      (EQ.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false for different numbers', () => {
      const vm = new VM();
      vm.dataStack.push(42);
      vm.dataStack.push(43);
      (EQ.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('works with strings', () => {
      const vm = new VM();
      vm.dataStack.push('hello');
      vm.dataStack.push('hello');
      (EQ.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false for different strings', () => {
      const vm = new VM();
      vm.dataStack.push('hello');
      vm.dataStack.push('world');
      (EQ.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (EQ.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('LT (<)', () => {
    test('returns true when a < b', () => {
      const vm = new VM();
      vm.dataStack.push(3);
      vm.dataStack.push(5);
      (LT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false when a >= b', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (LT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('returns false when equal', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(5);
      (LT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (LT.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('GT (>)', () => {
    test('returns true when a > b', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (GT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false when a <= b', () => {
      const vm = new VM();
      vm.dataStack.push(3);
      vm.dataStack.push(5);
      (GT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('returns false when equal', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(5);
      (GT.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (GT.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('LTE (<=)', () => {
    test('returns true when a < b', () => {
      const vm = new VM();
      vm.dataStack.push(3);
      vm.dataStack.push(5);
      (LTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns true when equal', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(5);
      (LTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false when a > b', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (LTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (LTE.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('GTE (>=)', () => {
    test('returns true when a > b', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      (GTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns true when equal', () => {
      const vm = new VM();
      vm.dataStack.push(5);
      vm.dataStack.push(5);
      (GTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(true);
    });

    test('returns false when a < b', () => {
      const vm = new VM();
      vm.dataStack.push(3);
      vm.dataStack.push(5);
      (GTE.body as (vm: VM) => void)(vm);
      expect(vm.dataStack.peek()).toBe(false);
    });

    test('throws on insufficient stack', () => {
      const vm = new VM();
      vm.dataStack.push(1);
      expect(() => (GTE.body as (vm: VM) => void)(vm)).toThrow('Stack underflow');
    });
  });

  describe('word metadata', () => {
    test('all words are protected', () => {
      expect(ADD.protected).toBe(true);
      expect(SUB.protected).toBe(true);
      expect(MUL.protected).toBe(true);
      expect(DIV.protected).toBe(true);
      expect(MOD.protected).toBe(true);
      expect(EQ.protected).toBe(true);
      expect(LT.protected).toBe(true);
      expect(GT.protected).toBe(true);
      expect(LTE.protected).toBe(true);
      expect(GTE.protected).toBe(true);
    });

    test('all words are CORE category', () => {
      expect(ADD.category).toBe('CORE');
      expect(SUB.category).toBe('CORE');
      expect(MUL.category).toBe('CORE');
      expect(DIV.category).toBe('CORE');
      expect(MOD.category).toBe('CORE');
      expect(EQ.category).toBe('CORE');
      expect(LT.category).toBe('CORE');
      expect(GT.category).toBe('CORE');
      expect(LTE.category).toBe('CORE');
      expect(GTE.category).toBe('CORE');
    });

    test('all words have stack effects', () => {
      expect(ADD.stackEffect).toBe('( a b -- sum )');
      expect(SUB.stackEffect).toBe('( a b -- difference )');
      expect(MUL.stackEffect).toBe('( a b -- product )');
      expect(DIV.stackEffect).toBe('( a b -- quotient )');
      expect(MOD.stackEffect).toBe('( a b -- remainder )');
      expect(EQ.stackEffect).toBe('( a b -- bool )');
      expect(LT.stackEffect).toBe('( a b -- bool )');
      expect(GT.stackEffect).toBe('( a b -- bool )');
      expect(LTE.stackEffect).toBe('( a b -- bool )');
      expect(GTE.stackEffect).toBe('( a b -- bool )');
    });
  });
});
