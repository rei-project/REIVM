# REIVM v0.1.1 Specification

**Extends**: v0.1.0  
**Focus**: Practical enablers - strings, console I/O, DOM primitives

---

## Rationale

v0.1.0 provides the core VM and arithmetic. v0.1.1 adds **practical capabilities** that enable:
- Text manipulation (essential for web)
- Observable execution (console output)
- DOM interaction (web artifacts)

This makes REIVM useful for **real exploration** before tackling control flow complexity.

---

## New Core Words

### String Operations

**File**: `src/core/strings.ts`

```typescript
export const StringWords: Word[] = [
  {
    name: 'CONCAT',
    stackEffect: '( str1 str2 -- str )',
    body: function(this: VM) {
      const str2 = String(this.dataStack.pop());
      const str1 = String(this.dataStack.pop());
      this.dataStack.push(str1 + str2);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Concatenate two strings'
    }
  },
  
  {
    name: 'LENGTH',
    stackEffect: '( str -- n )',
    body: function(this: VM) {
      const str = String(this.dataStack.pop());
      this.dataStack.push(str.length);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Get string length'
    }
  },
  
  {
    name: 'SUBSTRING',
    stackEffect: '( str start end -- substr )',
    body: function(this: VM) {
      const end = this.dataStack.pop() as number;
      const start = this.dataStack.pop() as number;
      const str = String(this.dataStack.pop());
      this.dataStack.push(str.substring(start, end));
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Extract substring from start to end'
    }
  },
  
  {
    name: 'TO-STRING',
    stackEffect: '( value -- str )',
    body: function(this: VM) {
      const value = this.dataStack.pop();
      this.dataStack.push(String(value));
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Convert value to string'
    }
  }
];
```

**Tests**:
```typescript
test('CONCAT joins strings', () => {
  const vm = bootstrapVM();
  vm.dataStack.push('hello');
  vm.dataStack.push(' world');
  vm.execute('CONCAT');
  expect(vm.dataStack.pop()).toBe('hello world');
});

test('LENGTH returns string length', () => {
  const vm = bootstrapVM();
  vm.dataStack.push('hello');
  vm.execute('LENGTH');
  expect(vm.dataStack.pop()).toBe(5);
});

test('SUBSTRING extracts portion', () => {
  const vm = bootstrapVM();
  vm.dataStack.push('hello world');
  vm.dataStack.push(0);
  vm.dataStack.push(5);
  vm.execute('SUBSTRING');
  expect(vm.dataStack.pop()).toBe('hello');
});
```

---

### Console I/O

**File**: `src/core/console.ts`

```typescript
export const ConsoleWords: Word[] = [
  {
    name: '.',
    stackEffect: '( value -- ) [prints]',
    body: function(this: VM) {
      const value = this.dataStack.pop();
      console.log(value);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Print top of stack with newline. Works with any type (numbers, strings, objects, etc.)'
    }
  },
  
  {
    name: 'EMIT',
    stackEffect: '( char-code -- ) [prints]',
    body: function(this: VM) {
      const code = this.dataStack.pop() as number;
      process.stdout.write(String.fromCharCode(code));
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Print single character from character code'
    }
  }
];
```

**Rationale for minimal console I/O**:
- `.` is essential - prints any value with newline
- `EMIT` is low-level primitive for character output
- Other formatting words (CR, SPACE, SPACES) can be defined as user words when needed:

```typescript
// These can be user-defined in REIWORD or applications:
// : CR 10 EMIT ;           ( -- ) newline
// : SPACE 32 EMIT ;        ( -- ) space character  
// : SPACES ( n -- ) ...    using loops when control flow available
```

This keeps CORE minimal while enabling everything through composition.

**Tests**:
```typescript
test('. prints any value type', () => {
  const vm = bootstrapVM();
  const spy = jest.spyOn(console, 'log').mockImplementation();
  
  // Number
  vm.dataStack.push(42);
  vm.execute('.');
  expect(spy).toHaveBeenCalledWith(42);
  
  // String
  vm.dataStack.push('hello');
  vm.execute('.');
  expect(spy).toHaveBeenCalledWith('hello');
  
  // Object
  const obj = { foo: 'bar' };
  vm.dataStack.push(obj);
  vm.execute('.');
  expect(spy).toHaveBeenCalledWith(obj);
  
  spy.mockRestore();
});

test('EMIT prints character', () => {
  const vm = bootstrapVM();
  const spy = jest.spyOn(process.stdout, 'write').mockImplementation();
  
  vm.dataStack.push(65); // ASCII 'A'
  vm.execute('EMIT');
  
  expect(spy).toHaveBeenCalledWith('A');
  spy.mockRestore();
});

test('user can define CR using EMIT', () => {
  const vm = bootstrapVM();
  vm.dictionary.define('CR', {
    name: 'CR',
    stackEffect: '( -- )',
    body: ['10', 'EMIT'], // newline character
    immediate: false,
    category: 'USER',
    metadata: { defined: new Date(), usageCount: 0 }
  });
  
  const spy = jest.spyOn(process.stdout, 'write').mockImplementation();
  vm.execute('CR');
  expect(spy).toHaveBeenCalledWith('\n');
  spy.mockRestore();
});
```

---

### DOM Primitives

**File**: `src/core/dom.ts`

**Important**: These only work in browser. Need runtime detection:

```typescript
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const DOMWords: Word[] = isBrowser ? [
  {
    name: 'CREATE-ELEMENT',
    stackEffect: '( tag-name -- element )',
    body: function(this: VM) {
      const tagName = String(this.dataStack.pop());
      const element = document.createElement(tagName);
      this.dataStack.push(element);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Create DOM element with given tag name'
    }
  },
  
  {
    name: 'APPEND-CHILD',
    stackEffect: '( parent child -- parent )',
    body: function(this: VM) {
      const child = this.dataStack.pop() as Node;
      const parent = this.dataStack.peek() as Node;
      parent.appendChild(child);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Append child to parent, leaves parent on stack'
    }
  },
  
  {
    name: 'SET-ATTRIBUTE',
    stackEffect: '( element key value -- element )',
    body: function(this: VM) {
      const value = String(this.dataStack.pop());
      const key = String(this.dataStack.pop());
      const element = this.dataStack.peek() as Element;
      element.setAttribute(key, value);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Set attribute on element, leaves element on stack'
    }
  },
  
  {
    name: 'SET-TEXT',
    stackEffect: '( element text -- element )',
    body: function(this: VM) {
      const text = String(this.dataStack.pop());
      const element = this.dataStack.peek() as HTMLElement;
      element.textContent = text;
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Set text content of element, leaves element on stack'
    }
  },
  
  {
    name: 'QUERY-SELECTOR',
    stackEffect: '( selector -- element|null )',
    body: function(this: VM) {
      const selector = String(this.dataStack.pop());
      const element = document.querySelector(selector);
      this.dataStack.push(element);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Find first element matching selector'
    }
  },
  
  {
    name: 'GET-ATTRIBUTE',
    stackEffect: '( element key -- value )',
    body: function(this: VM) {
      const key = String(this.dataStack.pop());
      const element = this.dataStack.pop() as Element;
      const value = element.getAttribute(key);
      this.dataStack.push(value);
    },
    protected: true,
    category: 'CORE',
    immediate: false,
    metadata: {
      defined: new Date(),
      usageCount: 0,
      documentation: 'Get attribute value from element'
    }
  }
] : [];
```

**Tests** (require jsdom or browser environment):
```typescript
// tests/dom.test.ts
import { describe, test, expect, beforeEach } from 'bun:test';
import { JSDOM } from 'jsdom';

describe('DOM words', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    global.document = dom.window.document;
    global.window = dom.window as any;
  });

  test('CREATE-ELEMENT creates element', () => {
    const vm = bootstrapVM();
    vm.dataStack.push('div');
    vm.execute('CREATE-ELEMENT');
    
    const element = vm.dataStack.pop();
    expect(element).toBeInstanceOf(dom.window.HTMLDivElement);
  });

  test('APPEND-CHILD adds child to parent', () => {
    const vm = bootstrapVM();
    vm.run('"div" CREATE-ELEMENT "span" CREATE-ELEMENT APPEND-CHILD');
    
    const parent = vm.dataStack.pop() as Element;
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].tagName).toBe('SPAN');
  });

  test('SET-ATTRIBUTE sets attribute', () => {
    const vm = bootstrapVM();
    vm.run('"div" CREATE-ELEMENT "id" "test-id" SET-ATTRIBUTE');
    
    const element = vm.dataStack.pop() as Element;
    expect(element.getAttribute('id')).toBe('test-id');
  });
});
```

---

## Updated Bootstrap

**File**: `src/bootstrap.ts`

```typescript
import { CoreWords } from './core/index.js';
import { StringWords } from './core/strings.js';
import { ConsoleWords } from './core/console.js';
import { DOMWords } from './core/dom.js';

export function bootstrapVM(config?: VMConfig): VM {
  const vm = new VM(config);
  
  // Load all core word groups
  [
    ...CoreWords,      // Arithmetic, stack ops from v0.1.0
    ...StringWords,    // New in v0.1.1
    ...ConsoleWords,   // New in v0.1.1
    ...DOMWords        // New in v0.1.1 (empty in Node.js)
  ].forEach(word => {
    vm.dictionary.define(word.name, word);
  });
  
  return vm;
}
```

---

## Example Usage

### String Manipulation

```typescript
const vm = bootstrapVM();

// Build a greeting
vm.run('"Hello" " " CONCAT "World" CONCAT');
console.log(vm.dataStack.pop()); // "Hello World"

// Get length
vm.run('"Hello World" LENGTH');
console.log(vm.dataStack.pop()); // 11

// Extract substring
vm.run('"Hello World" 0 5 SUBSTRING');
console.log(vm.dataStack.pop()); // "Hello"
```

### Console Output

```typescript
const vm = bootstrapVM();

// Print a value
vm.run('42 .');           // Prints: 42

// Print formatted output
vm.run('65 EMIT');        // Prints: A
vm.run('CR');             // Prints newline

// Print with spacing
vm.run('5 SPACES');       // Prints 5 spaces
```

### DOM Construction

```typescript
// In browser
const vm = bootstrapVM();

// Create a button
vm.run(`
  "button" CREATE-ELEMENT
    "id" "my-button" SET-ATTRIBUTE
    "Click me!" SET-TEXT
  "body" QUERY-SELECTOR
    APPEND-CHILD
  DROP
`);

// Result: <button id="my-button">Click me!</button> added to body
```

### Composing Operations

```typescript
const vm = bootstrapVM();

// Build and display a message
vm.run(`
  "User" " " CONCAT
  "ID:" CONCAT " " CONCAT
  42 TO-STRING CONCAT
  .
`);
// Prints: "User ID: 42"
```

---

## Browser Detection Pattern

For environment-specific words, use this pattern:

```typescript
// src/core/dom.ts
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const DOMWords: Word[] = isBrowser ? [
  // ... DOM words ...
] : [];
```

This way:
- In Node/Bun: DOMWords exports empty array
- In browser: DOMWords exports full DOM operations
- No runtime errors from missing globals

---

## Testing Strategy

### Unit Tests

- Test each word in isolation
- Mock console output (jest.spyOn)
- Use jsdom for DOM tests in Node

### Integration Tests

```typescript
test('string composition example', () => {
  const vm = bootstrapVM();
  vm.run('"Hello" " " CONCAT "World" CONCAT LENGTH');
  expect(vm.dataStack.pop()).toBe(11);
});

test('DOM element creation chain', () => {
  const vm = bootstrapVM();
  vm.run('"div" CREATE-ELEMENT "class" "container" SET-ATTRIBUTE');
  
  const element = vm.dataStack.pop() as Element;
  expect(element.tagName).toBe('DIV');
  expect(element.className).toBe('container');
});
```

### Browser Tests

Create `examples/browser-test.html`:
```html
<!DOCTYPE html>
<html>
<head><title>REIVM v0.1.1 Browser Test</title></head>
<body>
  <script type="module">
    import { bootstrapVM } from '../dist/index.js';
    
    const vm = bootstrapVM();
    
    // Test string ops
    vm.run('"Hello" " World" CONCAT');
    console.log('String test:', vm.dataStack.pop());
    
    // Test DOM ops
    vm.run(`
      "div" CREATE-ELEMENT
        "id" "test-div" SET-ATTRIBUTE
        "Test Content" SET-TEXT
      "body" QUERY-SELECTOR
        APPEND-CHILD
      DROP
    `);
    
    console.log('DOM test:', document.getElementById('test-div'));
  </script>
</body>
</html>
```

---

## Documentation Updates

### README

Add to "Core Words" section:

**String Operations**:
- `CONCAT` - Concatenate strings
- `LENGTH` - Get string length
- `SUBSTRING` - Extract substring
- `TO-STRING` - Convert value to string

**Console I/O**:
- `.` - Print any value with newline (numbers, strings, objects, etc.)
- `EMIT` - Print single character from character code

**Note**: Other console words like `CR` (newline), `SPACE`, `SPACES` can be defined as user words using these primitives.

**DOM Operations** (browser only):
- `CREATE-ELEMENT` - Create DOM element
- `APPEND-CHILD` - Append child to parent
- `SET-ATTRIBUTE` - Set element attribute
- `SET-TEXT` - Set text content
- `QUERY-SELECTOR` - Find element
- `GET-ATTRIBUTE` - Get attribute value

---

## Migration from v0.1.0

**Breaking changes**: None. v0.1.1 is purely additive.

**Upgrade path**:
```bash
bun update @rei-project/reivm
```

Existing code continues to work. New words are immediately available.

---

## v0.1.1 Deliverables

✅ String operations (4 words + tests)  
✅ Console I/O (2 words + tests)  
✅ DOM primitives (6 words + tests)  
✅ Updated bootstrap with all word groups  
✅ Browser detection for DOM words  
✅ Integration tests for common patterns  
✅ Browser test example  
✅ Updated documentation  

**Estimated effort**: 1 day for Claude Code (simplified from original estimate)

---

## After v0.1.1

With strings, console, and DOM primitives, users can:
- Build simple web artifacts
- Debug with console output
- Manipulate text effectively
- Create interactive UI elements

**Then** move to v0.2.0 for control flow, which is complex and needs this foundation to test properly.

---

*v0.1.1: From theoretical to practical.*