import { describe, test, expect, beforeEach } from 'bun:test';
import { JSDOM } from 'jsdom';

// Set up initial browser globals BEFORE importing anything
let dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).Element = dom.window.Element;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Node = dom.window.Node;

import { bootstrapVM } from '../src/bootstrap.js';
import { allDOMWords } from '../src/core/dom.js';

describe('DOM Operations', () => {
  function createTestVM() {
    const vm = bootstrapVM();
    // Manually load DOM words since we're in a test environment
    for (const word of allDOMWords) {
      vm.dictionary.define(word.name, word);
    }
    return vm;
  }

  beforeEach(() => {
    // Recreate JSDOM for each test to avoid contamination
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    (global as any).document = dom.window.document;
    (global as any).window = dom.window;
    (global as any).Element = dom.window.Element;
    (global as any).HTMLElement = dom.window.HTMLElement;
    (global as any).Node = dom.window.Node;
  });

  describe('CREATE-ELEMENT', () => {
    test('creates a div element', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');

      const element = vm.dataStack.pop();
      expect(element).toBeInstanceOf(dom.window.HTMLDivElement);
    });

    test('creates a span element', () => {
      const vm = createTestVM();
      vm.dataStack.push('span');
      vm.execute('CREATE-ELEMENT');

      const element = vm.dataStack.pop();
      expect(element).toBeInstanceOf(dom.window.HTMLSpanElement);
    });

    test('creates a button element', () => {
      const vm = createTestVM();
      vm.dataStack.push('button');
      vm.execute('CREATE-ELEMENT');

      const element = vm.dataStack.pop() as HTMLButtonElement;
      expect(element.tagName).toBe('BUTTON');
    });
  });

  describe('APPEND-CHILD', () => {
    test('adds child to parent', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('span');
      vm.execute('CREATE-ELEMENT');
      vm.execute('APPEND-CHILD');

      const parent = vm.dataStack.pop() as Element;
      expect(parent.children.length).toBe(1);
      expect(parent.children[0]!.tagName).toBe('SPAN');
    });

    test('leaves parent on stack', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('span');
      vm.execute('CREATE-ELEMENT');
      vm.execute('APPEND-CHILD');

      const element = vm.dataStack.peek() as Element;
      expect(element.tagName).toBe('DIV');
      expect(vm.dataStack.depth()).toBe(1);
    });

    test('can chain multiple appends', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('span');
      vm.execute('CREATE-ELEMENT');
      vm.execute('APPEND-CHILD');
      vm.dataStack.push('p');
      vm.execute('CREATE-ELEMENT');
      vm.execute('APPEND-CHILD');

      const parent = vm.dataStack.pop() as Element;
      expect(parent.children.length).toBe(2);
      expect(parent.children[0]!.tagName).toBe('SPAN');
      expect(parent.children[1]!.tagName).toBe('P');
    });
  });

  describe('SET-ATTRIBUTE', () => {
    test('sets id attribute', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('id');
      vm.dataStack.push('test-id');
      vm.execute('SET-ATTRIBUTE');

      const element = vm.dataStack.pop() as Element;
      expect(element.getAttribute('id')).toBe('test-id');
    });

    test('sets class attribute', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('class');
      vm.dataStack.push('container');
      vm.execute('SET-ATTRIBUTE');

      const element = vm.dataStack.pop() as Element;
      expect(element.className).toBe('container');
    });

    test('leaves element on stack', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('id');
      vm.dataStack.push('test');
      vm.execute('SET-ATTRIBUTE');

      expect(vm.dataStack.depth()).toBe(1);
      const element = vm.dataStack.peek() as Element;
      expect(element.tagName).toBe('DIV');
    });

    test('can chain multiple attributes', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('id');
      vm.dataStack.push('test');
      vm.execute('SET-ATTRIBUTE');
      vm.dataStack.push('class');
      vm.dataStack.push('foo');
      vm.execute('SET-ATTRIBUTE');

      const element = vm.dataStack.pop() as Element;
      expect(element.getAttribute('id')).toBe('test');
      expect(element.getAttribute('class')).toBe('foo');
    });
  });

  describe('SET-TEXT', () => {
    test('sets text content', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('Hello World');
      vm.execute('SET-TEXT');

      const element = vm.dataStack.pop() as HTMLElement;
      expect(element.textContent).toBe('Hello World');
    });

    test('leaves element on stack', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('text');
      vm.execute('SET-TEXT');

      expect(vm.dataStack.depth()).toBe(1);
      const element = vm.dataStack.peek() as Element;
      expect(element.tagName).toBe('DIV');
    });

    test('converts numbers to text', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push(42);
      vm.execute('SET-TEXT');

      const element = vm.dataStack.pop() as HTMLElement;
      expect(element.textContent).toBe('42');
    });
  });

  describe('QUERY-SELECTOR', () => {
    test('finds element by id', () => {
      const vm = createTestVM();
      const testDiv = dom.window.document.createElement('div');
      testDiv.id = 'test-div';
      dom.window.document.body.appendChild(testDiv);

      vm.dataStack.push('#test-div');
      vm.execute('QUERY-SELECTOR');

      const element = vm.dataStack.pop() as Element;
      expect(element).toBe(testDiv);
    });

    test('finds element by class', () => {
      const vm = createTestVM();
      const testDiv = dom.window.document.createElement('div');
      testDiv.className = 'test-class';
      dom.window.document.body.appendChild(testDiv);

      vm.dataStack.push('.test-class');
      vm.execute('QUERY-SELECTOR');

      const element = vm.dataStack.pop() as Element;
      expect(element).toBe(testDiv);
    });

    test('returns null for non-existent selector', () => {
      const vm = createTestVM();
      vm.dataStack.push('#non-existent');
      vm.execute('QUERY-SELECTOR');

      const result = vm.dataStack.pop();
      expect(result).toBeNull();
    });

    test('finds body element', () => {
      const vm = createTestVM();
      vm.dataStack.push('body');
      vm.execute('QUERY-SELECTOR');

      const element = vm.dataStack.pop() as Element;
      expect(element.tagName).toBe('BODY');
    });
  });

  describe('GET-ATTRIBUTE', () => {
    test('gets attribute value', () => {
      const vm = createTestVM();
      const div = dom.window.document.createElement('div');
      div.setAttribute('data-value', 'test-data');

      vm.dataStack.push(div);
      vm.dataStack.push('data-value');
      vm.execute('GET-ATTRIBUTE');

      expect(vm.dataStack.pop()).toBe('test-data');
    });

    test('returns null for non-existent attribute', () => {
      const vm = createTestVM();
      const div = dom.window.document.createElement('div');

      vm.dataStack.push(div);
      vm.dataStack.push('non-existent');
      vm.execute('GET-ATTRIBUTE');

      expect(vm.dataStack.pop()).toBeNull();
    });

    test('removes element from stack', () => {
      const vm = createTestVM();
      const div = dom.window.document.createElement('div');
      div.setAttribute('id', 'test');

      vm.dataStack.push(div);
      vm.dataStack.push('id');
      vm.execute('GET-ATTRIBUTE');

      expect(vm.dataStack.depth()).toBe(1);
      expect(vm.dataStack.pop()).toBe('test');
    });
  });

  describe('Integration: DOM element creation and manipulation', () => {
    test('creates and configures a button', () => {
      const vm = createTestVM();
      vm.dataStack.push('button');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('id');
      vm.dataStack.push('my-button');
      vm.execute('SET-ATTRIBUTE');
      vm.dataStack.push('Click me!');
      vm.execute('SET-TEXT');

      const button = vm.dataStack.pop() as HTMLButtonElement;
      expect(button.tagName).toBe('BUTTON');
      expect(button.id).toBe('my-button');
      expect(button.textContent).toBe('Click me!');
    });

    test('creates nested structure', () => {
      const vm = createTestVM();
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('class');
      vm.dataStack.push('container');
      vm.execute('SET-ATTRIBUTE');
      vm.dataStack.push('span');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('inner text');
      vm.execute('SET-TEXT');
      vm.execute('APPEND-CHILD');

      const container = vm.dataStack.pop() as Element;
      expect(container.className).toBe('container');
      expect(container.children.length).toBe(1);
      expect(container.children[0]!.tagName).toBe('SPAN');
      expect(container.children[0]!.textContent).toBe('inner text');
    });

    test('creates and appends to body', () => {
      const vm = createTestVM();
      // First get the body element
      vm.dataStack.push('body');
      vm.execute('QUERY-SELECTOR');  // Stack: [body-element]

      // Create the div as a child
      vm.dataStack.push('div');
      vm.execute('CREATE-ELEMENT');  // Stack: [body-element, div-element]
      vm.dataStack.push('id');
      vm.dataStack.push('test-div');
      vm.execute('SET-ATTRIBUTE');   // Stack: [body-element, div-element]
      vm.dataStack.push('Test Content');
      vm.execute('SET-TEXT');        // Stack: [body-element, div-element]

      // Now append: (parent child -- parent)
      vm.execute('APPEND-CHILD');    // Stack: [body-element]
      vm.execute('DROP');            // Stack: []

      const testDiv = dom.window.document.getElementById('test-div');
      expect(testDiv).not.toBeNull();
      expect(testDiv?.textContent).toBe('Test Content');
      expect(testDiv?.parentElement).toBe(dom.window.document.body);
    });

    test('builds complex structure with attributes and text', () => {
      const vm = createTestVM();
      vm.dataStack.push('article');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('id');
      vm.dataStack.push('post-1');
      vm.execute('SET-ATTRIBUTE');
      vm.dataStack.push('class');
      vm.dataStack.push('post');
      vm.execute('SET-ATTRIBUTE');
      vm.dataStack.push('h1');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('Title Here');
      vm.execute('SET-TEXT');
      vm.execute('APPEND-CHILD');
      vm.dataStack.push('p');
      vm.execute('CREATE-ELEMENT');
      vm.dataStack.push('Content here');
      vm.execute('SET-TEXT');
      vm.execute('APPEND-CHILD');

      const article = vm.dataStack.pop() as Element;
      expect(article.tagName).toBe('ARTICLE');
      expect(article.id).toBe('post-1');
      expect(article.className).toBe('post');
      expect(article.children.length).toBe(2);
      expect(article.children[0]!.tagName).toBe('H1');
      expect(article.children[0]!.textContent).toBe('Title Here');
      expect(article.children[1]!.tagName).toBe('P');
      expect(article.children[1]!.textContent).toBe('Content here');
    });
  });
});
