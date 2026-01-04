import type { Word } from '../word.js';
import type { VM } from '../vm.js';

/**
 * Browser detection - DOM words only available in browser environment
 * Using a function to allow for runtime detection (useful for testing)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * CREATE-ELEMENT - Create DOM element with given tag name
 * Stack effect: ( tag-name -- element )
 */
const CREATE_ELEMENT: Word = {
  name: 'CREATE-ELEMENT',
  stackEffect: '( tag-name -- element )',
  body: (vm: VM) => {
    const tagName = String(vm.dataStack.pop());
    const element = document.createElement(tagName);
    vm.dataStack.push(element);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Create DOM element with given tag name',
  },
};

/**
 * APPEND-CHILD - Append child to parent, leaves parent on stack
 * Stack effect: ( parent child -- parent )
 */
const APPEND_CHILD: Word = {
  name: 'APPEND-CHILD',
  stackEffect: '( parent child -- parent )',
  body: (vm: VM) => {
    const child = vm.dataStack.pop() as Node;
    const parent = vm.dataStack.peek() as Node;
    parent.appendChild(child);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Append child to parent, leaves parent on stack',
  },
};

/**
 * SET-ATTRIBUTE - Set attribute on element, leaves element on stack
 * Stack effect: ( element key value -- element )
 */
const SET_ATTRIBUTE: Word = {
  name: 'SET-ATTRIBUTE',
  stackEffect: '( element key value -- element )',
  body: (vm: VM) => {
    const value = String(vm.dataStack.pop());
    const key = String(vm.dataStack.pop());
    const element = vm.dataStack.peek() as Element;
    element.setAttribute(key, value);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Set attribute on element, leaves element on stack',
  },
};

/**
 * SET-TEXT - Set text content of element, leaves element on stack
 * Stack effect: ( element text -- element )
 */
const SET_TEXT: Word = {
  name: 'SET-TEXT',
  stackEffect: '( element text -- element )',
  body: (vm: VM) => {
    const text = String(vm.dataStack.pop());
    const element = vm.dataStack.peek() as HTMLElement;
    element.textContent = text;
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Set text content of element, leaves element on stack',
  },
};

/**
 * QUERY-SELECTOR - Find first element matching selector
 * Stack effect: ( selector -- element|null )
 */
const QUERY_SELECTOR: Word = {
  name: 'QUERY-SELECTOR',
  stackEffect: '( selector -- element|null )',
  body: (vm: VM) => {
    const selector = String(vm.dataStack.pop());
    const element = document.querySelector(selector);
    vm.dataStack.push(element);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Find first element matching selector',
  },
};

/**
 * GET-ATTRIBUTE - Get attribute value from element
 * Stack effect: ( element key -- value )
 */
const GET_ATTRIBUTE: Word = {
  name: 'GET-ATTRIBUTE',
  stackEffect: '( element key -- value )',
  body: (vm: VM) => {
    const key = String(vm.dataStack.pop());
    const element = vm.dataStack.pop() as Element;
    const value = element.getAttribute(key);
    vm.dataStack.push(value);
  },
  immediate: false,
  protected: true,
  category: 'CORE',
  metadata: {
    defined: new Date(),
    usageCount: 0,
    documentation: 'Get attribute value from element',
  },
};

/**
 * All DOM words (always available for testing).
 * Use this for testing or when you know the environment has DOM support.
 */
export const allDOMWords: Word[] = [
  CREATE_ELEMENT,
  APPEND_CHILD,
  SET_ATTRIBUTE,
  SET_TEXT,
  QUERY_SELECTOR,
  GET_ATTRIBUTE,
];

/**
 * All DOM operation words.
 * Empty array in Node/Bun environments, full set in browser.
 * Uses function call to allow runtime detection.
 */
export const domOps: Word[] = isBrowser() ? allDOMWords : [];
