import type { Word } from '../word.js';
import type { VM } from '../vm.js';

/**
 * CONCAT - Concatenate two strings
 * Stack effect: ( str1 str2 -- str )
 */
export const CONCAT: Word = {
  name: 'CONCAT',
  stackEffect: '( str1 str2 -- str )',
  body: (vm: VM) => {
    const str2 = String(vm.dataStack.pop());
    const str1 = String(vm.dataStack.pop());
    vm.dataStack.push(str1 + str2);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Concatenate two strings',
  },
};

/**
 * LENGTH - Get string length
 * Stack effect: ( str -- n )
 */
export const LENGTH: Word = {
  name: 'LENGTH',
  stackEffect: '( str -- n )',
  body: (vm: VM) => {
    const str = String(vm.dataStack.pop());
    vm.dataStack.push(str.length);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Get string length',
  },
};

/**
 * SUBSTRING - Extract substring from start to end
 * Stack effect: ( str start end -- substr )
 */
export const SUBSTRING: Word = {
  name: 'SUBSTRING',
  stackEffect: '( str start end -- substr )',
  body: (vm: VM) => {
    const end = vm.dataStack.pop() as number;
    const start = vm.dataStack.pop() as number;
    const str = String(vm.dataStack.pop());
    vm.dataStack.push(str.substring(start, end));
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Extract substring from start to end',
  },
};

/**
 * TO-STRING - Convert value to string
 * Stack effect: ( value -- str )
 */
export const TO_STRING: Word = {
  name: 'TO-STRING',
  stackEffect: '( value -- str )',
  body: (vm: VM) => {
    const value = vm.dataStack.pop();
    vm.dataStack.push(String(value));
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Convert value to string',
  },
};

/** All string operation words */
export const stringOps = [CONCAT, LENGTH, SUBSTRING, TO_STRING];
