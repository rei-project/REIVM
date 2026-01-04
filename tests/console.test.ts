import { describe, test, expect, mock, spyOn, afterEach } from 'bun:test';
import { bootstrapVM } from '../src/bootstrap.js';

describe('Console I/O Operations', () => {
  afterEach(() => {
    // Restore all mocks after each test
    mock.restore();
  });

  describe('.', () => {
    test('prints number with newline', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.dataStack.push(42);
      vm.execute('.');

      expect(spy).toHaveBeenCalledWith(42);
      spy.mockRestore();
    });

    test('prints string with newline', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.dataStack.push('hello');
      vm.execute('.');

      expect(spy).toHaveBeenCalledWith('hello');
      spy.mockRestore();
    });

    test('prints boolean with newline', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.dataStack.push(true);
      vm.execute('.');

      expect(spy).toHaveBeenCalledWith(true);
      spy.mockRestore();
    });

    test('prints object with newline', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      const obj = { foo: 'bar' };
      vm.dataStack.push(obj);
      vm.execute('.');

      expect(spy).toHaveBeenCalledWith(obj);
      spy.mockRestore();
    });

    test('removes value from stack', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.dataStack.push(42);
      vm.execute('.');

      expect(vm.dataStack.depth()).toBe(0);
      spy.mockRestore();
    });
  });

  describe('EMIT', () => {
    test('prints character from ASCII code', () => {
      const vm = bootstrapVM();
      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);

      vm.dataStack.push(65); // ASCII 'A'
      vm.execute('EMIT');

      expect(spy).toHaveBeenCalledWith('A');
      spy.mockRestore();
    });

    test('prints newline character', () => {
      const vm = bootstrapVM();
      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);

      vm.dataStack.push(10); // ASCII newline
      vm.execute('EMIT');

      expect(spy).toHaveBeenCalledWith('\n');
      spy.mockRestore();
    });

    test('prints space character', () => {
      const vm = bootstrapVM();
      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);

      vm.dataStack.push(32); // ASCII space
      vm.execute('EMIT');

      expect(spy).toHaveBeenCalledWith(' ');
      spy.mockRestore();
    });

    test('removes value from stack', () => {
      const vm = bootstrapVM();
      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);

      vm.dataStack.push(65);
      vm.execute('EMIT');

      expect(vm.dataStack.depth()).toBe(0);
      spy.mockRestore();
    });
  });

  describe('User-defined words using console primitives', () => {
    test('user can define CR using EMIT', () => {
      const vm = bootstrapVM();

      // Define CR (carriage return / newline)
      vm.dictionary.define('CR', {
        name: 'CR',
        stackEffect: '( -- )',
        body: (vm) => {
          vm.dataStack.push(10); // newline char code
          vm.execute('EMIT');
        },
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);
      vm.execute('CR');

      expect(spy).toHaveBeenCalledWith('\n');
      spy.mockRestore();
    });

    test('user can define SPACE using EMIT', () => {
      const vm = bootstrapVM();

      // Define SPACE
      vm.dictionary.define('SPACE', {
        name: 'SPACE',
        stackEffect: '( -- )',
        body: (vm) => {
          vm.dataStack.push(32); // space char code
          vm.execute('EMIT');
        },
        immediate: false,
        protected: false,
        category: 'USER',
        metadata: { defined: new Date(), usageCount: 0 },
      });

      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);
      vm.execute('SPACE');

      expect(spy).toHaveBeenCalledWith(' ');
      spy.mockRestore();
    });
  });

  describe('Integration: Console output', () => {
    test('print calculation result', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.run('5 3 + .');

      expect(spy).toHaveBeenCalledWith(8);
      spy.mockRestore();
    });

    test('print string composition', () => {
      const vm = bootstrapVM();
      const spy = spyOn(console, 'log').mockImplementation(() => {});

      vm.dataStack.push('Hello');
      vm.dataStack.push(' World');
      vm.run('CONCAT .');

      expect(spy).toHaveBeenCalledWith('Hello World');
      spy.mockRestore();
    });

    test('emit multiple characters', () => {
      const vm = bootstrapVM();
      const spy = spyOn(process.stdout, 'write').mockImplementation(() => true);

      vm.run('72 EMIT 105 EMIT'); // 'H' 'i'

      expect(spy).toHaveBeenNthCalledWith(1, 'H');
      expect(spy).toHaveBeenNthCalledWith(2, 'i');
      spy.mockRestore();
    });
  });
});
