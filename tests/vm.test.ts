import { describe, test, expect } from 'bun:test';
import { VM } from '../src/vm.ts';
import { bootstrapVM } from '../src/bootstrap.ts';
import { WordNotFoundError } from '../src/errors.ts';

describe('VM', () => {
  describe('constructor', () => {
    test('creates VM with default config', () => {
      const vm = new VM();
      expect(vm.dataStack.depth()).toBe(0);
      expect(vm.returnStack.depth()).toBe(0);
      expect(vm.dictionary.list()).toEqual([]);
    });

    test('creates VM with custom stack depth', () => {
      const vm = new VM({ stackDepth: 10 });
      expect(vm.dataStack.depth()).toBe(0);
    });
  });

  describe('parse', () => {
    test('parses simple code', () => {
      const vm = new VM();
      const tokens = vm.parse('5 3 +');
      expect(tokens).toEqual(['5', '3', '+']);
    });

    test('handles multiple spaces', () => {
      const vm = new VM();
      const tokens = vm.parse('5    3     +');
      expect(tokens).toEqual(['5', '3', '+']);
    });

    test('handles leading and trailing whitespace', () => {
      const vm = new VM();
      const tokens = vm.parse('  5 3 +  ');
      expect(tokens).toEqual(['5', '3', '+']);
    });

    test('returns empty array for empty string', () => {
      const vm = new VM();
      const tokens = vm.parse('');
      expect(tokens).toEqual([]);
    });

    test('returns empty array for whitespace only', () => {
      const vm = new VM();
      const tokens = vm.parse('   ');
      expect(tokens).toEqual([]);
    });
  });

  describe('execute', () => {
    test('executes word by name', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(42);
      vm.execute('DUP');
      expect(vm.dataStack.depth()).toBe(2);
      expect(vm.dataStack.pop()).toBe(42);
      expect(vm.dataStack.pop()).toBe(42);
    });

    test('executes word object', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(5);
      vm.dataStack.push(3);
      const word = vm.dictionary.find('+')!;
      vm.execute(word);
      expect(vm.dataStack.peek()).toBe(8);
    });

    test('throws WordNotFoundError for unknown word', () => {
      const vm = new VM();
      expect(() => vm.execute('UNKNOWN')).toThrow(WordNotFoundError);
      expect(() => vm.execute('UNKNOWN')).toThrow('Word not found: UNKNOWN');
    });

    test('executes compiled word', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('SQUARE', {
        name: 'SQUARE',
        stackEffect: '( n -- n² )',
        body: ['DUP', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.dataStack.push(5);
      vm.execute('SQUARE');
      expect(vm.dataStack.peek()).toBe(25);
    });
  });

  describe('run', () => {
    test('executes simple arithmetic', () => {
      const vm = bootstrapVM();
      vm.run('5 3 +');
      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.peek()).toBe(8);
    });

    test('executes multiple operations', () => {
      const vm = bootstrapVM();
      vm.run('5 3 + DUP *');
      expect(vm.dataStack.peek()).toBe(64);
    });

    test('handles negative numbers', () => {
      const vm = bootstrapVM();
      vm.run('-5 3 +');
      expect(vm.dataStack.peek()).toBe(-2);
    });

    test('handles floating point numbers', () => {
      const vm = bootstrapVM();
      vm.run('3.14 2 *');
      expect(vm.dataStack.peek()).toBeCloseTo(6.28, 2);
    });

    test('executes user-defined words', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('DOUBLE', {
        name: 'DOUBLE',
        stackEffect: '( n -- 2n )',
        body: ['DUP', '+'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('5 DOUBLE');
      expect(vm.dataStack.peek()).toBe(10);
    });

    test('throws on unknown word', () => {
      const vm = bootstrapVM();
      expect(() => vm.run('UNKNOWN')).toThrow(WordNotFoundError);
    });
  });

  describe('serialize', () => {
    test('serializes empty VM', () => {
      const vm = bootstrapVM();
      const state = vm.serialize();
      expect(state.version).toBe('0.1.0');
      expect(state.stack).toEqual([]);
      expect(state.dictionary).toEqual([]);
    });

    test('serializes stack contents', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(1);
      vm.dataStack.push(2);
      vm.dataStack.push(3);
      const state = vm.serialize();
      expect(state.stack).toEqual([1, 2, 3]);
    });

    test('serializes user-defined words', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('SQUARE', {
        name: 'SQUARE',
        stackEffect: '( n -- n² )',
        body: ['DUP', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const state = vm.serialize();
      expect(state.dictionary).toHaveLength(1);
      expect(state.dictionary[0]?.name).toBe('SQUARE');
      expect(state.dictionary[0]?.stackEffect).toBe('( n -- n² )');
    });

    test('does not serialize CORE words', () => {
      const vm = bootstrapVM();
      const state = vm.serialize();
      // CORE words should not be in serialized state
      expect(state.dictionary.every((w) => w.name !== 'DUP')).toBe(true);
      expect(state.dictionary.every((w) => w.name !== '+')).toBe(true);
    });

    test('marks native words as __NATIVE__', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('NATIVE', {
        name: 'NATIVE',
        stackEffect: '( -- )',
        body: () => {},
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const state = vm.serialize();
      const nativeWord = state.dictionary.find((w) => w.name === 'NATIVE');
      expect(nativeWord?.body).toBe('__NATIVE__');
    });
  });

  describe('deserialize', () => {
    test('restores stack contents', () => {
      const vm1 = bootstrapVM();
      vm1.dataStack.push(1);
      vm1.dataStack.push(2);
      vm1.dataStack.push(3);
      const state = vm1.serialize();

      const vm2 = bootstrapVM();
      vm2.deserialize(state);
      expect(vm2.dataStack.snapshot()).toEqual([1, 2, 3]);
    });

    test('restores user-defined words', () => {
      const vm1 = bootstrapVM();
      vm1.dictionary.define('SQUARE', {
        name: 'SQUARE',
        stackEffect: '( n -- n² )',
        body: ['DUP', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });
      const state = vm1.serialize();

      const vm2 = bootstrapVM();
      vm2.deserialize(state);
      vm2.dataStack.push(5);
      vm2.execute('SQUARE');
      expect(vm2.dataStack.peek()).toBe(25);
    });

    test('clears existing stack before restore', () => {
      const vm = bootstrapVM();
      vm.dataStack.push(99);
      vm.dataStack.push(99);

      const state = {
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        stack: [1, 2, 3],
        dictionary: [],
        config: {},
      };

      vm.deserialize(state);
      expect(vm.dataStack.snapshot()).toEqual([1, 2, 3]);
    });

    test('skips native words during deserialization', () => {
      const vm = bootstrapVM();
      const state = {
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        stack: [],
        dictionary: [
          {
            name: 'NATIVE',
            stackEffect: '( -- )',
            body: '__NATIVE__',
            immediate: false,
            metadata: { defined: new Date(), usageCount: 0 },
          },
        ],
        config: {},
      };

      vm.deserialize(state);
      expect(vm.dictionary.find('NATIVE')).toBeNull();
    });
  });

  describe('clone', () => {
    test('creates independent copy of VM', () => {
      const vm1 = bootstrapVM();
      vm1.dataStack.push(42);

      const vm2 = vm1.clone();
      vm2.dataStack.push(99);

      expect(vm1.dataStack.depth()).toBe(1);
      expect(vm2.dataStack.depth()).toBe(2);
      expect(vm1.dataStack.peek()).toBe(42);
      expect(vm2.dataStack.peek()).toBe(99);
    });

    test('clones include CORE words', () => {
      const vm1 = bootstrapVM();
      const vm2 = vm1.clone();

      vm2.dataStack.push(5);
      vm2.dataStack.push(3);
      vm2.execute('+');
      expect(vm2.dataStack.peek()).toBe(8);
    });

    test('clones include user-defined words', () => {
      const vm1 = bootstrapVM();
      vm1.dictionary.define('SQUARE', {
        name: 'SQUARE',
        stackEffect: '( n -- n² )',
        body: ['DUP', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const vm2 = vm1.clone();
      vm2.dataStack.push(5);
      vm2.execute('SQUARE');
      expect(vm2.dataStack.peek()).toBe(25);
    });

    test('clones preserve stack contents', () => {
      const vm1 = bootstrapVM();
      vm1.dataStack.push(1);
      vm1.dataStack.push(2);
      vm1.dataStack.push(3);

      const vm2 = vm1.clone();
      expect(vm2.dataStack.snapshot()).toEqual([1, 2, 3]);
    });

    test('changes to clone do not affect original', () => {
      const vm1 = bootstrapVM();
      vm1.dataStack.push(5);
      vm1.dataStack.push(3);

      const vm2 = vm1.clone();
      vm2.execute('+');

      expect(vm1.dataStack.depth()).toBe(2);
      expect(vm2.dataStack.depth()).toBe(1);
    });
  });
});

describe('bootstrapVM', () => {
  test('creates VM with CORE words loaded', () => {
    const vm = bootstrapVM();
    expect(vm.dictionary.find('DUP')).not.toBeNull();
    expect(vm.dictionary.find('+')).not.toBeNull();
    expect(vm.dictionary.find('SWAP')).not.toBeNull();
  });

  test('loads all stack operations', () => {
    const vm = bootstrapVM();
    expect(vm.dictionary.find('DUP')).not.toBeNull();
    expect(vm.dictionary.find('DROP')).not.toBeNull();
    expect(vm.dictionary.find('SWAP')).not.toBeNull();
    expect(vm.dictionary.find('OVER')).not.toBeNull();
    expect(vm.dictionary.find('ROT')).not.toBeNull();
    expect(vm.dictionary.find('2DUP')).not.toBeNull();
    expect(vm.dictionary.find('2DROP')).not.toBeNull();
    expect(vm.dictionary.find('2SWAP')).not.toBeNull();
  });

  test('loads all arithmetic operations', () => {
    const vm = bootstrapVM();
    expect(vm.dictionary.find('+')).not.toBeNull();
    expect(vm.dictionary.find('-')).not.toBeNull();
    expect(vm.dictionary.find('*')).not.toBeNull();
    expect(vm.dictionary.find('/')).not.toBeNull();
    expect(vm.dictionary.find('MOD')).not.toBeNull();
  });

  test('loads all comparison operations', () => {
    const vm = bootstrapVM();
    expect(vm.dictionary.find('=')).not.toBeNull();
    expect(vm.dictionary.find('<')).not.toBeNull();
    expect(vm.dictionary.find('>')).not.toBeNull();
    expect(vm.dictionary.find('<=')).not.toBeNull();
    expect(vm.dictionary.find('>=')).not.toBeNull();
  });

  test('accepts custom config', () => {
    const vm = bootstrapVM({ stackDepth: 10 });
    expect(vm.dictionary.find('DUP')).not.toBeNull();
  });
});
