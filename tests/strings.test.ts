import { describe, test, expect } from 'bun:test';
import { bootstrapVM } from '../src/bootstrap.js';

describe('String Operations', () => {
  describe('CONCAT', () => {
    test('joins two strings', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('hello');
      vm.dataStack.push(' world');
      vm.execute('CONCAT');
      expect(vm.dataStack.pop()).toBe('hello world');
    });

    test('converts non-strings to strings before concatenating', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(42);
      vm.dataStack.push(' is the answer');
      vm.execute('CONCAT');
      expect(vm.dataStack.pop()).toBe('42 is the answer');
    });

    test('can be chained', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('Hello');
      vm.dataStack.push(' ');
      vm.execute('CONCAT');
      vm.dataStack.push('World');
      vm.execute('CONCAT');
      expect(vm.dataStack.pop()).toBe('Hello World');
    });
  });

  describe('LENGTH', () => {
    test('returns string length', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('hello');
      vm.execute('LENGTH');
      expect(vm.dataStack.pop()).toBe(5);
    });

    test('returns 0 for empty string', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('');
      vm.execute('LENGTH');
      expect(vm.dataStack.pop()).toBe(0);
    });

    test('works with numbers converted to strings', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(12345);
      vm.execute('LENGTH');
      expect(vm.dataStack.pop()).toBe(5);
    });
  });

  describe('SUBSTRING', () => {
    test('extracts portion of string', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('hello world');
      vm.dataStack.push(0);
      vm.dataStack.push(5);
      vm.execute('SUBSTRING');
      expect(vm.dataStack.pop()).toBe('hello');
    });

    test('extracts middle portion', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('hello world');
      vm.dataStack.push(6);
      vm.dataStack.push(11);
      vm.execute('SUBSTRING');
      expect(vm.dataStack.pop()).toBe('world');
    });

    test('handles end beyond string length', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('hello');
      vm.dataStack.push(0);
      vm.dataStack.push(100);
      vm.execute('SUBSTRING');
      expect(vm.dataStack.pop()).toBe('hello');
    });
  });

  describe('TO-STRING', () => {
    test('converts number to string', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(42);
      vm.execute('TO-STRING');
      const result = vm.dataStack.pop();
      expect(result).toBe('42');
      expect(typeof result).toBe('string');
    });

    test('converts boolean to string', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(true);
      vm.execute('TO-STRING');
      expect(vm.dataStack.pop()).toBe('true');
    });

    test('leaves string unchanged', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('already a string');
      vm.execute('TO-STRING');
      expect(vm.dataStack.pop()).toBe('already a string');
    });
  });

  describe('Integration: String composition', () => {
    test('build and measure a greeting', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('Hello');
      vm.dataStack.push(' ');
      vm.execute('CONCAT');
      vm.dataStack.push('World');
      vm.run('CONCAT LENGTH');
      expect(vm.dataStack.pop()).toBe(11);
    });

    test('build message with numbers', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('User');
      vm.dataStack.push(' ');
      vm.execute('CONCAT');
      vm.dataStack.push('ID:');
      vm.execute('CONCAT');
      vm.dataStack.push(' ');
      vm.execute('CONCAT');
      vm.run('42 TO-STRING CONCAT');
      expect(vm.dataStack.pop()).toBe('User ID: 42');
    });

    test('extract and measure substring', () => {
      const vm = bootstrapVM();
      vm.dataStack.push('Hello World');
      vm.run('0 5 SUBSTRING LENGTH');
      expect(vm.dataStack.pop()).toBe(5);
    });
  });
});
