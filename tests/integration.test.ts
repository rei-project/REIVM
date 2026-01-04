import { describe, test, expect } from 'bun:test';
import { bootstrapVM } from '../src/bootstrap.ts';

describe('Integration Tests', () => {
  describe('basic computation', () => {
    test('simple addition', () => {
      const vm = bootstrapVM();
      vm.run('5 3 +');
      expect(vm.dataStack.pop()).toBe(8);
    });

    test('chained arithmetic', () => {
      const vm = bootstrapVM();
      vm.run('10 3 - 2 *');
      expect(vm.dataStack.pop()).toBe(14);
    });

    test('expression evaluation: (5 + 3) * 2', () => {
      const vm = bootstrapVM();
      vm.run('5 3 + 2 *');
      expect(vm.dataStack.pop()).toBe(16);
    });

    test('square calculation: n²', () => {
      const vm = bootstrapVM();
      vm.run('8 DUP *');
      expect(vm.dataStack.pop()).toBe(64);
    });
  });

  describe('stack manipulation', () => {
    test('swap and subtract', () => {
      const vm = bootstrapVM();
      vm.run('3 10 SWAP -');
      expect(vm.dataStack.pop()).toBe(7);
    });

    test('over and multiply', () => {
      const vm = bootstrapVM();
      vm.run('2 3 OVER * +'); // 2 3 2 * + = 2 + 6 = 8
      expect(vm.dataStack.pop()).toBe(8);
    });

    test('complex stack manipulation', () => {
      const vm = bootstrapVM();
      vm.run('1 2 3 ROT'); // 1 2 3 -> 2 3 1
      expect(vm.dataStack.pop()).toBe(1);
      expect(vm.dataStack.pop()).toBe(3);
      expect(vm.dataStack.pop()).toBe(2);
    });
  });

  describe('user-defined words', () => {
    test('define and use SQUARE word', () => {
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

      vm.run('8 SQUARE');
      expect(vm.dataStack.pop()).toBe(64);
    });

    test('define and use CUBE word', () => {
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
      vm.dictionary.define('CUBE', {
        name: 'CUBE',
        stackEffect: '( n -- n³ )',
        body: ['DUP', 'SQUARE', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('5 CUBE');
      expect(vm.dataStack.pop()).toBe(125);
    });

    test('define average word', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('AVERAGE', {
        name: 'AVERAGE',
        stackEffect: '( a b -- avg )',
        body: ['+', '2', '/'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('10 20 AVERAGE');
      expect(vm.dataStack.pop()).toBe(15);
    });
  });

  describe('comparison operations', () => {
    test('equality check', () => {
      const vm = bootstrapVM();
      vm.run('5 5 =');
      expect(vm.dataStack.pop()).toBe(true);

      vm.run('5 3 =');
      expect(vm.dataStack.pop()).toBe(false);
    });

    test('less than comparison', () => {
      const vm = bootstrapVM();
      vm.run('3 5 <');
      expect(vm.dataStack.pop()).toBe(true);

      vm.run('5 3 <');
      expect(vm.dataStack.pop()).toBe(false);
    });

    test('combined comparisons', () => {
      const vm = bootstrapVM();
      vm.run('10 20 < 5 3 > ='); // (10 < 20) = (5 > 3) -> true = true -> true
      expect(vm.dataStack.pop()).toBe(true);
    });
  });

  describe('session persistence', () => {
    test('save and restore session', () => {
      const vm1 = bootstrapVM();
      vm1.run('5 3 +');
      vm1.dictionary.define('DOUBLE', {
        name: 'DOUBLE',
        stackEffect: '( n -- 2n )',
        body: ['DUP', '+'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const state = vm1.serialize();

      const vm2 = bootstrapVM();
      vm2.deserialize(state);

      expect(vm2.dataStack.peek()).toBe(8);
      vm2.run('DOUBLE');
      expect(vm2.dataStack.peek()).toBe(16);
    });

    test('persist complex state', () => {
      const vm1 = bootstrapVM();
      vm1.dictionary.define('TRIPLE', {
        name: 'TRIPLE',
        stackEffect: '( n -- 3n )',
        body: ['3', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });
      vm1.run('1 2 3 4 5');

      const state = vm1.serialize();
      const vm2 = bootstrapVM();
      vm2.deserialize(state);

      expect(vm2.dataStack.snapshot()).toEqual([1, 2, 3, 4, 5]);
      vm2.run('TRIPLE');
      expect(vm2.dataStack.pop()).toBe(15);
    });
  });

  describe('branching and exploration', () => {
    test('explore multiple paths', () => {
      const base = bootstrapVM();
      base.run('5 3');

      const addPath = base.clone();
      addPath.run('+');
      expect(addPath.dataStack.peek()).toBe(8);

      const mulPath = base.clone();
      mulPath.run('*');
      expect(mulPath.dataStack.peek()).toBe(15);

      // Base unchanged
      expect(base.dataStack.depth()).toBe(2);
      expect(base.dataStack.snapshot()).toEqual([5, 3]);
    });

    test('explore computation branches', () => {
      const vm = bootstrapVM();
      vm.run('10');

      const squarePath = vm.clone();
      squarePath.run('DUP *');

      const doublePath = vm.clone();
      doublePath.run('2 *');

      expect(squarePath.dataStack.peek()).toBe(100);
      expect(doublePath.dataStack.peek()).toBe(20);
      expect(vm.dataStack.peek()).toBe(10);
    });

    test('clone preserves user words', () => {
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
      vm1.run('5');

      const vm2 = vm1.clone();
      vm2.run('SQUARE');

      expect(vm2.dataStack.peek()).toBe(25);
      expect(vm1.dataStack.peek()).toBe(5);
    });
  });

  describe('realistic scenarios', () => {
    test('calculate area of rectangle', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('AREA', {
        name: 'AREA',
        stackEffect: '( width height -- area )',
        body: ['*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('10 5 AREA');
      expect(vm.dataStack.pop()).toBe(50);
    });

    test('calculate perimeter of rectangle', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('PERIMETER', {
        name: 'PERIMETER',
        stackEffect: '( width height -- perimeter )',
        body: ['2DUP', '+', '2', '*'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('10 5 PERIMETER');
      expect(vm.dataStack.pop()).toBe(30);
    });

    test('temperature conversion (Celsius to Fahrenheit)', () => {
      const vm = bootstrapVM();
      vm.dictionary.define('C->F', {
        name: 'C->F',
        stackEffect: '( celsius -- fahrenheit )',
        body: ['9', '*', '5', '/', '32', '+'],
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      vm.run('100 C->F');
      expect(vm.dataStack.pop()).toBe(212);

      vm.run('0 C->F');
      expect(vm.dataStack.pop()).toBe(32);
    });

    test('factorial helper (manual iteration)', () => {
      const vm = bootstrapVM();
      // Calculate 5! = 5 * 4 * 3 * 2 * 1
      vm.run('5 4 * 3 * 2 * 1 *');
      expect(vm.dataStack.pop()).toBe(120);
    });

    test('distance calculation helpers', () => {
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

      // Calculate 3² + 4² (part of distance formula)
      vm.run('3 SQUARE 4 SQUARE +');
      expect(vm.dataStack.pop()).toBe(25);
    });
  });

  describe('edge cases', () => {
    test('handles empty input', () => {
      const vm = bootstrapVM();
      vm.run('');
      expect(vm.dataStack.depth()).toBe(0);
    });

    test('handles whitespace-only input', () => {
      const vm = bootstrapVM();
      vm.run('   ');
      expect(vm.dataStack.depth()).toBe(0);
    });

    test('handles large numbers', () => {
      const vm = bootstrapVM();
      vm.run('1000000 2000000 +');
      expect(vm.dataStack.pop()).toBe(3000000);
    });

    test('handles negative results', () => {
      const vm = bootstrapVM();
      vm.run('5 10 -');
      expect(vm.dataStack.pop()).toBe(-5);
    });

    test('handles division by zero', () => {
      const vm = bootstrapVM();
      vm.run('10 0 /');
      expect(vm.dataStack.pop()).toBe(Infinity);
    });
  });
});
