import { describe, test, expect } from 'bun:test';
import { Dictionary } from '../src/dictionary.ts';
import type { Word } from '../src/word.ts';

describe('Dictionary', () => {
  describe('constructor', () => {
    test('creates empty dictionary', () => {
      const dict = new Dictionary();
      expect(dict.list()).toEqual([]);
    });
  });

  describe('find', () => {
    test('returns null for missing word', () => {
      const dict = new Dictionary();
      expect(dict.find('NONEXISTENT')).toBeNull();
    });

    test('returns word after define', () => {
      const dict = new Dictionary();
      dict.define('TEST', {
        stackEffect: '( -- )',
        body: [],
        category: 'USER',
      });
      const word = dict.find('TEST');
      expect(word).not.toBeNull();
      expect(word?.name).toBe('TEST');
    });

    test('is case-sensitive', () => {
      const dict = new Dictionary();
      dict.define('TEST', {
        stackEffect: '( -- )',
        body: [],
      });
      expect(dict.find('TEST')).not.toBeNull();
      expect(dict.find('test')).toBeNull();
      expect(dict.find('Test')).toBeNull();
    });
  });

  describe('define', () => {
    test('adds word to dictionary', () => {
      const dict = new Dictionary();
      dict.define('DUP', {
        stackEffect: '( n -- n n )',
        body: [],
        protected: true,
        category: 'CORE',
      });

      const word = dict.find('DUP');
      expect(word?.name).toBe('DUP');
      expect(word?.stackEffect).toBe('( n -- n n )');
      expect(word?.protected).toBe(true);
      expect(word?.category).toBe('CORE');
    });

    test('adds word to definition order', () => {
      const dict = new Dictionary();
      dict.define('FIRST', { body: [] });
      dict.define('SECOND', { body: [] });
      dict.define('THIRD', { body: [] });
      expect(dict.list()).toEqual(['FIRST', 'SECOND', 'THIRD']);
    });

    test('sets default values for optional fields', () => {
      const dict = new Dictionary();
      dict.define('TEST', { body: [] });

      const word = dict.find('TEST');
      expect(word?.name).toBe('TEST');
      expect(word?.stackEffect).toBe('( -- )');
      expect(word?.immediate).toBe(false);
      expect(word?.protected).toBe(false);
      expect(word?.category).toBe('USER');
      expect(word?.metadata.defined).toBeInstanceOf(Date);
      expect(word?.metadata.usageCount).toBe(0);
    });

    test('allows redefining non-protected words', () => {
      const dict = new Dictionary();
      dict.define('TEST', {
        stackEffect: '( -- a )',
        body: [],
      });
      dict.define('TEST', {
        stackEffect: '( -- b )',
        body: [],
      });

      const word = dict.find('TEST');
      expect(word?.stackEffect).toBe('( -- b )');
    });

    test('stores previous definition when redefining', () => {
      const dict = new Dictionary();
      const firstBody = ['WORD1'];
      const secondBody = ['WORD2'];

      dict.define('TEST', {
        stackEffect: '( -- a )',
        body: firstBody,
      });
      dict.define('TEST', {
        stackEffect: '( -- b )',
        body: secondBody,
      });

      const word = dict.find('TEST');
      expect(word?.metadata.previousDefinitions).toHaveLength(1);
      expect(word?.metadata.previousDefinitions?.[0]?.definition.stackEffect).toBe('( -- a )');
      expect(word?.metadata.previousDefinitions?.[0]?.definition.body).toEqual(firstBody);
    });

    test('throws when redefining protected word', () => {
      const dict = new Dictionary();
      dict.define('CORE-WORD', {
        body: [],
        protected: true,
        category: 'CORE',
      });

      expect(() => {
        dict.define('CORE-WORD', { body: [] });
      }).toThrow('Cannot redefine protected word: CORE-WORD');
    });

    test('does not duplicate in definition order when redefining', () => {
      const dict = new Dictionary();
      dict.define('TEST', { body: [] });
      dict.define('TEST', { body: [] });
      expect(dict.list()).toEqual(['TEST']);
    });
  });

  describe('forget', () => {
    test('removes word from dictionary', () => {
      const dict = new Dictionary();
      dict.define('TEST', { body: [] });
      dict.forget('TEST');
      expect(dict.find('TEST')).toBeNull();
    });

    test('removes word from definition order', () => {
      const dict = new Dictionary();
      dict.define('FIRST', { body: [] });
      dict.define('SECOND', { body: [] });
      dict.define('THIRD', { body: [] });
      dict.forget('SECOND');
      expect(dict.list()).toEqual(['FIRST', 'THIRD']);
    });

    test('throws when forgetting protected word', () => {
      const dict = new Dictionary();
      dict.define('PROTECTED', {
        body: [],
        protected: true,
      });

      expect(() => {
        dict.forget('PROTECTED');
      }).toThrow('Cannot forget protected word: PROTECTED');
    });

    test('throws when forgetting unknown word', () => {
      const dict = new Dictionary();
      expect(() => {
        dict.forget('UNKNOWN');
      }).toThrow('Cannot forget unknown word: UNKNOWN');
    });
  });

  describe('list', () => {
    test('returns empty array for empty dictionary', () => {
      const dict = new Dictionary();
      expect(dict.list()).toEqual([]);
    });

    test('returns all words when no filter', () => {
      const dict = new Dictionary();
      dict.define('CORE1', { body: [], category: 'CORE' });
      dict.define('USER1', { body: [], category: 'USER' });
      dict.define('STD1', { body: [], category: 'STANDARD' });
      expect(dict.list()).toEqual(['CORE1', 'USER1', 'STD1']);
    });

    test('filters by CORE category', () => {
      const dict = new Dictionary();
      dict.define('CORE1', { body: [], category: 'CORE' });
      dict.define('USER1', { body: [], category: 'USER' });
      dict.define('CORE2', { body: [], category: 'CORE' });
      expect(dict.list('CORE')).toEqual(['CORE1', 'CORE2']);
    });

    test('filters by USER category', () => {
      const dict = new Dictionary();
      dict.define('CORE1', { body: [], category: 'CORE' });
      dict.define('USER1', { body: [], category: 'USER' });
      dict.define('USER2', { body: [], category: 'USER' });
      expect(dict.list('USER')).toEqual(['USER1', 'USER2']);
    });

    test('filters by STANDARD category', () => {
      const dict = new Dictionary();
      dict.define('CORE1', { body: [], category: 'CORE' });
      dict.define('STD1', { body: [], category: 'STANDARD' });
      dict.define('STD2', { body: [], category: 'STANDARD' });
      expect(dict.list('STANDARD')).toEqual(['STD1', 'STD2']);
    });

    test('maintains definition order in filtered results', () => {
      const dict = new Dictionary();
      dict.define('A', { body: [], category: 'USER' });
      dict.define('B', { body: [], category: 'CORE' });
      dict.define('C', { body: [], category: 'USER' });
      dict.define('D', { body: [], category: 'CORE' });
      dict.define('E', { body: [], category: 'USER' });
      expect(dict.list('USER')).toEqual(['A', 'C', 'E']);
      expect(dict.list('CORE')).toEqual(['B', 'D']);
    });
  });

  describe('edge cases', () => {
    test('handles words with native function bodies', () => {
      const dict = new Dictionary();
      const nativeFn = () => {
        /* native implementation */
      };
      dict.define('NATIVE', {
        body: nativeFn,
        category: 'CORE',
      });

      const word = dict.find('NATIVE');
      expect(word?.body).toBe(nativeFn);
    });

    test('handles words with array bodies', () => {
      const dict = new Dictionary();
      const compiledBody = ['DUP', 'SWAP', 'DROP'];
      dict.define('COMPILED', {
        body: compiledBody,
        category: 'USER',
      });

      const word = dict.find('COMPILED');
      expect(word?.body).toEqual(compiledBody);
    });

    test('preserves metadata through redefine', () => {
      const dict = new Dictionary();
      dict.define('TEST', {
        body: [],
        metadata: {
          defined: new Date(),
          usageCount: 42,
          documentation: 'First version',
        },
      });

      const firstWord = dict.find('TEST');
      const firstDefined = firstWord?.metadata.defined;

      dict.define('TEST', {
        body: [],
        metadata: {
          defined: new Date(),
          usageCount: 0,
          documentation: 'Second version',
        },
      });

      const word = dict.find('TEST');
      expect(word?.metadata.documentation).toBe('Second version');
      expect(word?.metadata.previousDefinitions?.[0]?.definition.metadata.documentation).toBe(
        'First version'
      );
    });
  });
});
