# REIVM

**A stack-based virtual machine implementing Forth-like semantics for the REI framework.**

REIVM is the execution engine at the heart of REI. It provides a simple, observable, and clonable virtual machine that makes computation transparent and explorable.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![Tests](https://img.shields.io/badge/tests-182%20passing-brightgreen.svg)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Features

- ✅ **Stack-based execution** - All computation flows through observable data stack
- ✅ **18 CORE words** - Stack operations, arithmetic, and comparisons
- ✅ **User-defined words** - Extend the VM with custom compiled words
- ✅ **Session persistence** - Serialize and restore VM state
- ✅ **Branching support** - Clone VMs to explore multiple paths
- ✅ **Browser compatible** - No Node.js dependencies
- ✅ **Type-safe** - Full TypeScript support with strict mode
- ✅ **Well-tested** - 182 tests with 100% pass rate

## Installation

```bash
bun install
```

This project requires [Bun](https://bun.sh) v1.3.5 or later.

## Quick Start

```typescript
import { bootstrapVM } from './src/bootstrap.ts';

// Create a VM with CORE words loaded
const vm = bootstrapVM();

// Execute REI code
vm.run('5 3 +');
console.log(vm.dataStack.pop()); // 8

// Chain operations
vm.run('5 3 + DUP *'); // (5+3)² = 64
console.log(vm.dataStack.pop()); // 64
```

## Core Concepts

### The Stack

Everything in REIVM revolves around the **data stack**. Values are pushed onto the stack, and words operate on stack values.

```typescript
const vm = bootstrapVM();

// Push values
vm.dataStack.push(5);
vm.dataStack.push(3);

// Execute a word
vm.execute('+'); // Pops 5 and 3, pushes 8

// Check the result
console.log(vm.dataStack.peek()); // 8
```

### Words

A **word** is the fundamental unit of execution. Words can be:

1. **Native words** - Implemented as JavaScript functions
2. **Compiled words** - Arrays of other word names

```typescript
// Define a compiled word
vm.dictionary.define('SQUARE', {
  name: 'SQUARE',
  stackEffect: '( n -- n² )',
  body: ['DUP', '*'],  // Duplicate, then multiply
  immediate: false,
  protected: false,
  category: 'USER',
  metadata: { defined: new Date(), usageCount: 0 }
});

vm.run('8 SQUARE');
console.log(vm.dataStack.pop()); // 64
```

### Execution

The `run()` method parses and executes a string of REI code:

```typescript
vm.run('10 20 + 2 /'); // Average of 10 and 20
console.log(vm.dataStack.pop()); // 15
```

Tokens are processed left to right:
- Numbers are pushed onto the stack
- Words are looked up and executed

## CORE Words

REIVM includes 18 built-in CORE words:

### Stack Operations

| Word | Stack Effect | Description |
|------|--------------|-------------|
| `DUP` | `( n -- n n )` | Duplicate top value |
| `DROP` | `( n -- )` | Remove top value |
| `SWAP` | `( a b -- b a )` | Swap top two values |
| `OVER` | `( a b -- a b a )` | Copy second value to top |
| `ROT` | `( a b c -- b c a )` | Rotate top three values |
| `2DUP` | `( a b -- a b a b )` | Duplicate top two values |
| `2DROP` | `( a b -- )` | Remove top two values |
| `2SWAP` | `( a b c d -- c d a b )` | Swap top two pairs |

### Arithmetic

| Word | Stack Effect | Description |
|------|--------------|-------------|
| `+` | `( a b -- sum )` | Add two numbers |
| `-` | `( a b -- difference )` | Subtract b from a |
| `*` | `( a b -- product )` | Multiply two numbers |
| `/` | `( a b -- quotient )` | Divide a by b |
| `MOD` | `( a b -- remainder )` | Modulo operation |

### Comparison

| Word | Stack Effect | Description |
|------|--------------|-------------|
| `=` | `( a b -- bool )` | Test equality |
| `<` | `( a b -- bool )` | Test less than |
| `>` | `( a b -- bool )` | Test greater than |
| `<=` | `( a b -- bool )` | Test less than or equal |
| `>=` | `( a b -- bool )` | Test greater than or equal |

## API Reference

### `bootstrapVM(config?)`

Create a new VM instance with CORE words loaded.

```typescript
const vm = bootstrapVM();
const vm = bootstrapVM({ stackDepth: 1024 });
```

### `VM.run(code: string)`

Parse and execute a code string.

```typescript
vm.run('5 3 + DUP *');
```

### `VM.execute(wordOrName: Word | string)`

Execute a single word.

```typescript
vm.execute('DUP');
vm.execute(myWord);
```

### `VM.serialize(): VMState`

Serialize VM state for persistence.

```typescript
const state = vm.serialize();
localStorage.setItem('session', JSON.stringify(state));
```

### `VM.deserialize(state: VMState)`

Restore VM state from serialized data.

```typescript
const state = JSON.parse(localStorage.getItem('session'));
vm.deserialize(state);
```

### `VM.clone(): VM`

Create an independent copy of the VM.

```typescript
const vm2 = vm1.clone();
vm2.run('DUP *'); // Changes don't affect vm1
```

## Examples

### Basic Arithmetic

```typescript
const vm = bootstrapVM();

// Simple calculation
vm.run('10 20 +');
console.log(vm.dataStack.pop()); // 30

// Expression: (5 + 3) * 2
vm.run('5 3 + 2 *');
console.log(vm.dataStack.pop()); // 16
```

### Custom Words

```typescript
const vm = bootstrapVM();

// Define a word to calculate area
vm.dictionary.define('AREA', {
  name: 'AREA',
  stackEffect: '( width height -- area )',
  body: ['*'],
  immediate: false,
  protected: false,
  category: 'USER',
  metadata: { defined: new Date(), usageCount: 0 }
});

vm.run('10 5 AREA');
console.log(vm.dataStack.pop()); // 50
```

### Temperature Conversion

```typescript
const vm = bootstrapVM();

// Celsius to Fahrenheit: (C * 9 / 5) + 32
vm.dictionary.define('C->F', {
  name: 'C->F',
  stackEffect: '( celsius -- fahrenheit )',
  body: ['9', '*', '5', '/', '32', '+'],
  immediate: false,
  protected: false,
  category: 'USER',
  metadata: { defined: new Date(), usageCount: 0 }
});

vm.run('100 C->F');
console.log(vm.dataStack.pop()); // 212

vm.run('0 C->F');
console.log(vm.dataStack.pop()); // 32
```

### Session Persistence

```typescript
// Save session
const vm1 = bootstrapVM();
vm1.run('5 3 +');
vm1.dictionary.define('DOUBLE', {
  name: 'DOUBLE',
  stackEffect: '( n -- 2n )',
  body: ['DUP', '+'],
  immediate: false,
  protected: false,
  category: 'USER',
  metadata: { defined: new Date(), usageCount: 0 }
});

const state = vm1.serialize();
localStorage.setItem('my-session', JSON.stringify(state));

// Restore session later
const savedState = JSON.parse(localStorage.getItem('my-session'));
const vm2 = bootstrapVM();
vm2.deserialize(savedState);
console.log(vm2.dataStack.peek()); // 8
vm2.run('DOUBLE');
console.log(vm2.dataStack.peek()); // 16
```

### Branching for Exploration

```typescript
const base = bootstrapVM();
base.run('5 3'); // Stack: [5, 3]

// Explore addition path
const addPath = base.clone();
addPath.run('+');
console.log('Add result:', addPath.dataStack.peek()); // 8

// Explore multiplication path
const mulPath = base.clone();
mulPath.run('*');
console.log('Mul result:', mulPath.dataStack.peek()); // 15

// Original unchanged
console.log('Base stack:', base.dataStack.snapshot()); // [5, 3]
```

## Testing

Run the test suite:

```bash
bun test
```

Run tests in watch mode:

```bash
bun test --watch
```

Run type checking:

```bash
bun run type-check
```

### Test Coverage

- **182 tests** across 6 test files
- **100% pass rate**
- Tests cover:
  - Stack operations
  - Dictionary operations
  - All CORE words
  - VM execution
  - Serialization/deserialization
  - Cloning
  - Integration scenarios

## Project Structure

```
REIVM/
├── src/
│   ├── SPEC.md               # Initial implementation specification
│   ├── SPEC_vn.n.n.md        # Incremental implementation specification
├── src/
│   ├── index.ts              # Main export
│   ├── vm.ts                 # VM class
│   ├── stack.ts              # Stack implementation
│   ├── dictionary.ts         # Dictionary implementation
│   ├── word.ts               # Word type definitions
│   ├── errors.ts             # Error classes
│   ├── bootstrap.ts          # VM initialization
│   └── core/
│       ├── index.ts          # Core words export
│       ├── stack-ops.ts      # Stack manipulation words
│       └── arithmetic.ts     # Arithmetic & comparison words
├── tests/
│   ├── stack.test.ts
│   ├── dictionary.test.ts
│   ├── vm.test.ts
│   ├── integration.test.ts
│   └── core/
│       ├── stack-ops.test.ts
│       └── arithmetic.test.ts
├── package.json
├── tsconfig.json
├── SESSION_ARCHITECTURE.md   # Session & branching design
└── README.md                 # This file
```

## Design Philosophy

REIVM follows the [REI Design Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md):

### Simplicity is a Survival Strategy

- Prefer boring over clever
- Make it work correctly first, optimize never (unless needed)
- When in doubt, do less

### The Stack is the Source of Truth

- All computation flows through the data stack
- Stack is observable at every step
- No hidden state transformations

### Protected vs User Words

- **CORE words** are `protected: true` - cannot be modified or forgotten
- **USER words** can be freely redefined
- Previous definitions are stored for introspection

## REI Design Reference

REIVM implements the virtual machine as specified in the [REI Framework](https://github.com/rei-project/REI).

**Required reading for contributors:**

1. [REI Manifesto](https://github.com/rei-project/REI/blob/main/MANIFESTO.md) - Philosophical foundation
2. [Design Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md) - Decision-making framework
3. [Technical Specifications](https://github.com/rei-project/REI/blob/main/SPECIFICATIONS.md) - Requirements
4. [REIVM Component Spec](https://github.com/rei-project/REI/blob/main/components/REIVM.md) - Component requirements

## Version 0.1.0 Scope

This release includes:

- ✅ Complete stack implementation
- ✅ Complete dictionary implementation
- ✅ 18 CORE words (stack ops, arithmetic, comparisons)
- ✅ VM execution engine (run, execute, parse)
- ✅ Bootstrap function
- ✅ Error handling (all error types)
- ✅ Serialization/deserialization
- ✅ Cloning support
- ✅ ESM build for Bun and browser
- ✅ TypeScript type definitions
- ✅ 182 tests with 100% pass rate

## What's NOT in v0.1.0

These features are deferred to future versions:

- Control flow (IF/THEN/BEGIN/UNTIL) - v0.2.0
- Source file parsing (REILOADER component) - Future
- Advanced dictionary operations - Future
- Tracing support - Optional enhancement
- REPL interface (that's REIMON's job)
- DOM integration (that's REIWORD's job)

## Browser Compatibility

REIVM targets modern browsers:

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

**No Node.js APIs used** - works in any modern JavaScript environment.

## Contributing

When implementing features or fixing bugs:

1. Read the [REI Design Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md)
2. Check [SPEC.md](./specs/SPEC.md) for implementation requirements
3. Ensure all tests pass (`bun test`)
4. Ensure type checking passes (`bun run type-check`)
5. Follow the existing code style
6. Add tests for new features

## License

See the [REI Framework](https://github.com/rei-project/REI) for license information.

## Acknowledgments

Built with [Bun](https://bun.sh) - a fast all-in-one JavaScript runtime.

---

**REIVM v0.1.0** - Simple. Observable. Explorable.
