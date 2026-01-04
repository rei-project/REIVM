# REIVM Implementation Specification

**Version**: 0.1.0  
**Target**: ESM library for Bun and Browser  
**Language**: TypeScript (compiled to JavaScript ESM)

---

## Overview

REIVM is the virtual machine component of the REI framework. This document specifies the **implementation details** for building REIVM as a reusable library.

**Design Authority**: [REI Framework](https://github.com/rei-project/REI)  
**Component Spec**: [REIVM.md](https://github.com/rei-project/REI/blob/main/components/REIVM.md)

---

## Project Structure

```
REIVM/
├── src/
│   ├── index.ts              # Main export
│   ├── vm.ts                 # VM class
│   ├── stack.ts              # Stack implementation
│   ├── dictionary.ts         # Dictionary implementation
│   ├── word.ts               # Word type definitions
│   ├── errors.ts             # Error classes
│   ├── core/
│   │   ├── index.ts         # Core words export
│   │   ├── stack-ops.ts     # DUP, DROP, SWAP, etc.
│   │   ├── arithmetic.ts    # +, -, *, /
│   │   ├── control.ts       # IF, BEGIN, etc.
│   │   └── dictionary.ts    # DEFINE, FORGET, etc.
│   └── bootstrap.ts          # VM initialization with core words
├── tests/
│   ├── stack.test.ts
│   ├── dictionary.test.ts
│   ├── core/
│   │   ├── stack-ops.test.ts
│   │   └── arithmetic.test.ts
│   └── integration.test.ts
├── package.json
├── tsconfig.json
├── README.md
├── SPEC.md                   # This file
└── REI_REFERENCE.md          # Links to design docs
```

---

## Build Configuration

### Package.json

```json
{
  "name": "@rei-project/reivm",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "bun build src/index.ts --outdir=dist --target=browser --format=esm && tsc --emitDeclarationOnly",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Type Definitions

### Core Types

```typescript
// src/word.ts

export type WordBody = Word[] | ((vm: VM) => void);

export interface Word {
  name: string;
  stackEffect: string;
  body: WordBody;
  immediate: boolean;
  protected: boolean;
  category: 'CORE' | 'STANDARD' | 'USER';
  metadata: WordMetadata;
}

export interface WordMetadata {
  defined: Date;
  usageCount: number;
  previousDefinitions?: Array<{
    timestamp: Date;
    definition: Word;
  }>;
  documentation?: string;
}

export type StackValue = number | string | boolean | object | null | undefined;
```

### Error Types

```typescript
// src/errors.ts

export class REIError extends Error {
  constructor(
    message: string,
    public type: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'REIError';
  }
}

export class StackOverflowError extends REIError {
  constructor() {
    super('Stack overflow', 'STACK_OVERFLOW');
  }
}

export class StackUnderflowError extends REIError {
  constructor() {
    super('Stack underflow', 'STACK_UNDERFLOW');
  }
}

export class WordNotFoundError extends REIError {
  constructor(name: string) {
    super(`Word not found: ${name}`, 'WORD_NOT_FOUND', { word: name });
  }
}

export class ControlFlowError extends REIError {
  constructor(message: string) {
    super(message, 'CONTROL_FLOW_ERROR');
  }
}
```

---

## API Surface

### Main Export

```typescript
// src/index.ts

export { VM } from './vm.js';
export { Stack } from './stack.js';
export { Dictionary } from './dictionary.js';
export { bootstrapVM } from './bootstrap.js';
export * from './word.js';
export * from './errors.js';

// Re-export for convenience
export { default as CoreWords } from './core/index.js';
```

### VM Class

```typescript
// src/vm.ts

export class VM {
  public dataStack: Stack;
  public returnStack: Stack;
  public dictionary: Dictionary;
  public tracing: boolean;
  public trace: TraceStep[];

  constructor(config?: VMConfig);
  
  // Execution
  execute(wordOrName: Word | string): void;
  run(code: string): void;
  
  // Introspection
  inspectStack(): StackInspection;
  inspectDictionary(): DictionaryInspection;
  inspectWord(name: string): WordInspection | null;
  
  // Tracing
  enableTrace(): void;
  disableTrace(): void;
  getTrace(): TraceStep[];
  clearTrace(): void;
  
  // Error handling
  executeWithErrorContext(word: Word | string): ExecutionResult;
  
  // Serialization
  serialize(): VMState;
  deserialize(state: VMState): void;
  
  // Cloning (for branching/exploration)
  clone(): VM;
  
  // Internal (exposed for testing/debugging)
  parse(code: string): string[];
}

export interface VMConfig {
  stackDepth?: number;
  returnStackDepth?: number;
}

export interface TraceStep {
  word: string;
  stackBefore: StackValue[];
  stackAfter: StackValue[];
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  error?: {
    type: string;
    message: string;
    context: Record<string, unknown>;
  };
}

export interface VMState {
  version: string;
  timestamp: string;
  stack: StackValue[];
  dictionary: SerializedWord[];
  config: VMConfig;
}

export interface SerializedWord {
  name: string;
  stackEffect: string;
  body: string;
  immediate: boolean;
  metadata: WordMetadata;
}
```

### Stack Class

```typescript
// src/stack.ts

export class Stack {
  constructor(maxDepth?: number);
  
  push(value: StackValue): void;
  pop(): StackValue;
  peek(): StackValue;
  depth(): number;
  clear(): void;
  snapshot(): StackValue[];
}
```

### Dictionary Class

```typescript
// src/dictionary.ts

export class Dictionary {
  constructor();
  
  define(name: string, word: Partial<Word>): void;
  find(name: string): Word | null;
  forget(name: string): void;
  list(filter?: WordCategory): string[];
  
  // Internal
  private words: Map<string, Word>;
  private definitionOrder: string[];
}

export type WordCategory = 'CORE' | 'STANDARD' | 'USER';
```

---

## Implementation Requirements

### Stack Implementation

**File**: `src/stack.ts`

**Requirements**:
- Use simple array backing store
- Bounds checking on every push/pop
- Throw `StackOverflowError` when exceeding maxDepth
- Throw `StackUnderflowError` when popping empty stack
- Default max depth: 256
- Snapshot should return a copy, not reference

**Test coverage**:
- Push to full stack throws
- Pop from empty stack throws
- Peek doesn't modify stack
- Depth returns correct count
- Clear removes all values
- Snapshot is independent copy

### Dictionary Implementation

**File**: `src/dictionary.ts`

**Requirements**:
- Use `Map<string, Word>` for O(1) lookup
- Maintain insertion order in `definitionOrder` array
- Protected words cannot be redefined or forgotten
- Store previous definitions when redefining
- List method filters by category if provided

**Test coverage**:
- Find returns null for missing words
- Define adds to dictionary and order list
- Redefine updates word and stores previous version
- Forget throws on protected words
- List filters correctly by category

### Core Words

**Location**: `src/core/`

**Implementation strategy**:
- Each file exports word definitions as plain objects
- `index.ts` collects and exports all core words
- Native implementations (functions, not word arrays)
- All words marked as `protected: true`, `category: 'CORE'`

**Required word groups**:

1. **Stack Operations** (`stack-ops.ts`):
   - DUP, DROP, SWAP, OVER, ROT
   - 2DUP, 2DROP, 2SWAP

2. **Arithmetic** (`arithmetic.ts`):
   - +, -, *, /, MOD
   - Comparison: =, <, >, <=, >=

3. **Control Flow** (`control.ts`):
   - IF, THEN, ELSE
   - BEGIN, UNTIL, AGAIN
   - (These are complex - may defer to v0.2)

4. **Dictionary Operations** (`dictionary.ts`):
   - WORDS (list all words)
   - SEE (word name - for REIMON use)

**Test coverage**:
- Each word tested in isolation
- Stack effects verified (depth and values)
- Error cases tested (underflow, type mismatches if applicable)

### Bootstrap Function

**File**: `src/bootstrap.ts`

```typescript
export function bootstrapVM(config?: VMConfig): VM {
  const vm = new VM(config);
  
  // Load all core words
  CoreWords.forEach(word => {
    vm.dictionary.define(word.name, word);
  });
  
  return vm;
}
```

**Requirements**:
- Creates fresh VM instance
- Loads all CORE words from `core/index.ts`
- Returns ready-to-use VM
- Should be only way to create VM in normal usage

---

## Testing Strategy

### Unit Tests

**Framework**: Bun's built-in test runner

**Structure**:
```typescript
import { describe, test, expect } from 'bun:test';
import { Stack } from '../src/stack';

describe('Stack', () => {
  test('push adds value to top', () => {
    const stack = new Stack();
    stack.push(42);
    expect(stack.peek()).toBe(42);
    expect(stack.depth()).toBe(1);
  });
  
  test('pop removes and returns top value', () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);
    expect(stack.pop()).toBe(2);
    expect(stack.depth()).toBe(1);
  });
  
  test('pop on empty stack throws StackUnderflowError', () => {
    const stack = new Stack();
    expect(() => stack.pop()).toThrow('Stack underflow');
  });
});
```

### Integration Tests

**File**: `tests/integration.test.ts`

**Test scenarios**:
```typescript
test('complete word execution flow', () => {
  const vm = bootstrapVM();
  vm.run('5 3 + DUP *'); // (5+3)^2 = 64
  expect(vm.dataStack.pop()).toBe(64);
});

test('word definition and execution', () => {
  const vm = bootstrapVM();
  vm.dictionary.define('SQUARE', {
    name: 'SQUARE',
    stackEffect: '( n -- n² )',
    body: ['DUP', '*'],
    immediate: false,
    category: 'USER',
    metadata: { defined: new Date(), usageCount: 0 }
  });
  
  vm.run('8 SQUARE');
  expect(vm.dataStack.pop()).toBe(64);
});
```

### Test Coverage Goals

- **Minimum**: 80% code coverage
- **Priority**: All public APIs fully tested
- **Focus**: Error cases and edge conditions
- **Integration**: At least 10 realistic usage scenarios

---

## Browser Compatibility

### Requirements

**Target**: Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)

**Compatibility notes**:
- No Node.js-specific APIs
- No `process`, `Buffer`, `fs`, etc.
- Use only standard JavaScript features
- Keep bundle size small (<50KB unminified)

**Testing in browser**:
Create `examples/browser.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>REIVM Browser Test</title>
</head>
<body>
  <script type="module">
    import { bootstrapVM } from '../dist/index.js';
    
    const vm = bootstrapVM();
    vm.run('5 3 +');
    console.log('Result:', vm.dataStack.pop()); // Should log 8
  </script>
</body>
</html>
```

---

## Development Workflow

### Initial Implementation Order

1. **Phase 1: Foundation**
   - `src/errors.ts` - Error classes
   - `src/word.ts` - Type definitions
   - `src/stack.ts` - Stack implementation + tests
   - `src/dictionary.ts` - Dictionary implementation + tests

2. **Phase 2: Core Words**
   - `src/core/stack-ops.ts` - Stack manipulation words + tests
   - `src/core/arithmetic.ts` - Arithmetic words + tests
   - `src/core/index.ts` - Collect and export

3. **Phase 3: VM**
   - `src/vm.ts` - VM class (basic execution) + tests
   - `src/bootstrap.ts` - Bootstrap function
   - Integration tests

4. **Phase 4: Advanced Features**
   - Tracing support
   - Serialization/deserialization
   - Cloning support (vm.clone())
   - Error context

5. **Phase 5: Control Flow** (Defer to v0.2 if time-consuming)
   - `src/core/control.ts` - IF/THEN/BEGIN/UNTIL
   - Instruction pointer management
   - Complex integration tests

### Definition of Done (per component)

✅ Implementation complete  
✅ Unit tests passing (>80% coverage)  
✅ TypeScript types exported  
✅ JSDoc comments on public APIs  
✅ Integration test verifying component  
✅ Works in both Bun and browser  

---

## Documentation Requirements

### JSDoc Comments

All public APIs must have JSDoc:

```typescript
/**
 * Execute a word or sequence of words.
 * 
 * @param wordOrName - Word object or word name to execute
 * @throws {WordNotFoundError} If word name not in dictionary
 * @throws {StackUnderflowError} If word requires more stack values than available
 * 
 * @example
 * ```typescript
 * vm.execute('DUP');
 * vm.execute(myWordObject);
 * ```
 */
execute(wordOrName: Word | string): void;
```

### README Updates

As implementation progresses, update README with:
- Installation instructions
- Basic usage examples
- Link to full API documentation (when published)
- Browser usage examples

---

## Quality Standards

### Code Style

- **Formatting**: Use Prettier (if added) or Bun's defaults
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Clarity**: Prefer explicit over clever
- **Comments**: Explain why, not what (code should be self-documenting)

### Performance

**Not a priority** in v0.1, but avoid:
- Obvious O(n²) algorithms where O(n) is simple
- Unnecessary allocations in hot paths
- Deep recursion (prefer iteration)

### Error Messages

All errors must include:
- Clear message explaining what went wrong
- Context (stack state, word name, etc.)
- Suggestion for fix (when obvious)

**Good**: `Stack underflow: attempted to POP from empty stack`  
**Bad**: `Error in POP`

---

## Version 0.1.0 Scope

### Must Have

- ✅ Stack implementation (full API)
- ✅ Dictionary implementation (full API)
- ✅ Core stack operations (DUP, DROP, SWAP, OVER, ROT)
- ✅ Core arithmetic (+, -, *, /)
- ✅ VM execution (basic run/execute)
- ✅ Bootstrap function
- ✅ Error handling (all error types)
- ✅ ESM build for Bun and browser
- ✅ TypeScript type definitions
- ✅ 80%+ test coverage

### Should Have

- Tracing support
- Serialization/deserialization
- Full comparison operators
- 2DUP, 2DROP, 2SWAP

### Could Have (defer to v0.2)

- Control flow (IF/THEN/BEGIN/UNTIL)
- Instruction pointer management
- Advanced dictionary operations
- REPL mode (that's REIMON's job anyway)

### Won't Have in v0.1

- Optimization/compilation
- Type checking
- Async words
- DOM integration (that's REIWORD's job)

---

## Success Criteria

REIVM v0.1.0 is complete when:

1. ✅ All "Must Have" features implemented
2. ✅ Test suite passes in Bun
3. ✅ Example runs in browser
4. ✅ TypeScript builds without errors
5. ✅ Published to npm (or ready to publish)
6. ✅ README has usage examples
7. ✅ Follows all REI design principles
8. ✅ Code reviewed against REIVM component spec

---

## For Claude Code

When implementing REIVM:

1. **Read the design docs first** (REI_REFERENCE.md links)
2. **Follow the implementation order** (Phase 1 → 2 → 3 → 4)
3. **Test as you go** (don't write all code then test)
4. **Check specifications** when unsure (this file + REI/components/REIVM.md)
5. **Prefer boring over clever** (REI Principle 7)
6. **Make everything observable** (REI Principle 2)
7. **Keep stack as source of truth** (REI Principle 2)

When stuck or making design decisions:
- Consult [REI Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md)
- Prefer the simpler approach
- Make it work correctly first, optimize never (unless needed)
- When in doubt, ask or do less

---

**This specification is the contract for v0.1.0. Follow it, and REIVM will be correct.**
