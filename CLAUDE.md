# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REIVM is the virtual machine component of the REI framework - a stack-based VM implementing Forth-like semantics. This is a TypeScript/ESM library targeting both Bun and browser environments.

**Critical Context**: Before making any implementation decisions, you MUST read:
1. [REI Manifesto](https://github.com/rei-project/REI/blob/main/MANIFESTO.md) - Philosophical foundation
2. [Design Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md) - Decision-making framework
3. [Technical Specifications](https://github.com/rei-project/REI/blob/main/SPECIFICATIONS.md)
4. [REIVM Component Spec](https://github.com/rei-project/REI/blob/main/components/REIVM.md)

The local SPEC.md and SESSION_ARCHITECTURE.md files are authoritative for implementation details.

## Development Commands

### Running Code
```bash
bun run index.ts          # Run main entry point
bun run <file>.ts         # Run specific file
```

### Testing
```bash
bun test                  # Run all tests
bun test --watch          # Run tests in watch mode
bun test <file>           # Run specific test file
```

### Type Checking
```bash
bun run type-check        # TypeScript type checking (tsc --noEmit)
```

### Building (when implemented)
```bash
bun build src/index.ts --outdir=dist --target=browser --format=esm
tsc --emitDeclarationOnly # Generate .d.ts files
```

Note: The build process targets ESM modules for both Bun and browser environments. No Node.js-specific APIs are allowed.

## Architecture Overview

### Core Components

REIVM is structured in layers:

1. **Stack** (`src/stack.ts`) - Array-backed stack with bounds checking (max depth: 256)
2. **Dictionary** (`src/dictionary.ts`) - Map-based word storage with O(1) lookup
3. **VM** (`src/vm.ts`) - Main execution engine coordinating stack, return stack, and dictionary
4. **Core Words** (`src/core/`) - Protected built-in words (stack ops, arithmetic, control flow)
5. **Bootstrap** (`src/bootstrap.ts`) - VM initialization with CORE words loaded

### Key Concepts

**Words**: The fundamental unit of execution. Each word has:
- `name`: Identifier
- `stackEffect`: Documentation (e.g., `( n -- n² )`)
- `body`: Either native function `(vm: VM) => void` or array of other words
- `immediate`: Execute during compilation vs. execution
- `protected`: Cannot be redefined/forgotten (CORE words)
- `category`: 'CORE' | 'STANDARD' | 'USER'

**Execution Model**:
- Parse input string into tokens
- Resolve each token to a word in dictionary
- Execute word (either native function or compiled word list)
- All state changes flow through the data stack

**Session/Branching Support** (v0.1.0):
- `vm.serialize()` / `vm.deserialize()` - Persist VM state
- `vm.clone()` - Deep copy for exploration/branching
- Applications orchestrate multiple VMs (REIVM itself is single-VM focused)

### What REIVM Does NOT Do

- Parse source files (future: REILOADER component)
- Manage multiple VMs (application responsibility)
- Provide REPL interface (that's REIMON)
- DOM integration (that's REIWORD)

## Implementation Guidelines

### REI Design Principles Applied

**Simplicity is a Survival Strategy**:
- Prefer boring over clever
- Make it work correctly first, optimize never (unless needed)
- When in doubt, do less
- Avoid premature abstraction

**Stack as Source of Truth**:
- All computation flows through data stack
- Stack is observable at every step
- No hidden state transformations

**Protected vs User Words**:
- CORE words are `protected: true` - cannot be modified/forgotten
- USER words can be freely redefined
- Previous definitions stored in word metadata for introspection

### Implementation Order (from SPEC.md)

The codebase should be built in phases:

1. **Phase 1: Foundation** - errors.ts, word.ts, stack.ts, dictionary.ts
2. **Phase 2: Core Words** - stack-ops.ts, arithmetic.ts, core/index.ts
3. **Phase 3: VM** - vm.ts (basic execution), bootstrap.ts
4. **Phase 4: Advanced** - Tracing, serialization, cloning, error context
5. **Phase 5: Control Flow** - IF/THEN/BEGIN/UNTIL (may defer to v0.2)

### Error Handling

All errors extend `REIError` with:
- Clear message explaining what went wrong
- `type` field for programmatic handling
- Optional `context` object with relevant state

Standard error types:
- `StackOverflowError` - Exceeded max stack depth
- `StackUnderflowError` - Pop/peek on empty stack
- `WordNotFoundError` - Unknown word name during execution
- `ControlFlowError` - Malformed control structures

### Testing Requirements

- Use Bun's built-in test runner (`bun:test`)
- Minimum 80% code coverage
- Test structure: `describe` blocks per class/module, `test` for each behavior
- Priority: All public APIs, error cases, edge conditions
- Integration tests for realistic usage scenarios

### Browser Compatibility

- Target: Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)
- No Node.js APIs: `process`, `Buffer`, `fs`, etc.
- Keep bundle size <50KB unminified
- Test in browser with example HTML file

### Code Style

- **Formatting**: Use Bun defaults
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Comments**: JSDoc on all public APIs; inline comments explain "why" not "what"
- **Exports**: Use explicit named exports, avoid default exports
- **Clarity**: Prefer explicit over clever code

## Project-Specific Conventions

### File Extensions
- Use `.ts` for TypeScript source
- Import statements should include `.js` extension (for ESM compatibility): `import { VM } from './vm.js'`

### TypeScript Configuration
- Strict mode enabled
- Module system: ESNext with bundler resolution
- `noEmit: true` (Bun handles transpilation)
- No emitting declarations in default tsconfig (separate build step)

### Stack Effects Notation
Document word stack effects in Forth notation:
- `( n -- n² )` - Takes one number, leaves its square
- `( a b -- b a )` - Swaps top two values
- `( -- )` - No stack effect

## Version 0.1.0 Scope

### Must Have
- Stack implementation (full API)
- Dictionary implementation (full API)
- Core stack operations (DUP, DROP, SWAP, OVER, ROT)
- Core arithmetic (+, -, *, /)
- VM execution (basic run/execute)
- Bootstrap function
- Error handling (all error types)
- ESM build for Bun and browser
- TypeScript type definitions
- 80%+ test coverage
- `vm.clone()` method for branching support

### Should Have (if time permits)
- Tracing support
- Serialization/deserialization
- Full comparison operators
- 2DUP, 2DROP, 2SWAP

### Deferred to v0.2
- Control flow (IF/THEN/BEGIN/UNTIL)
- Source file parsing (REILOADER component)
- Advanced dictionary operations

## Common Patterns

### Creating and Using a VM
```typescript
import { bootstrapVM } from './src/bootstrap.js';

const vm = bootstrapVM();  // Loads CORE words
vm.run('5 3 +');           // Execute code
console.log(vm.dataStack.peek());  // 8
```

### Defining Custom Words
```typescript
vm.dictionary.define('SQUARE', {
  name: 'SQUARE',
  stackEffect: '( n -- n² )',
  body: ['DUP', '*'],  // Or native: (vm) => { ... }
  immediate: false,
  protected: false,
  category: 'USER',
  metadata: { defined: new Date(), usageCount: 0 }
});
```

### Branching/Exploration
```typescript
const base = bootstrapVM();
base.run('5 3');

const addPath = base.clone();
addPath.run('+');  // Explores addition

const mulPath = base.clone();
mulPath.run('*');  // Explores multiplication

// base VM unchanged
```

## When in Doubt

1. **Check SPEC.md** for implementation requirements
2. **Consult SESSION_ARCHITECTURE.md** for session/branching semantics
3. **Reference REI design docs** for philosophical guidance
4. **Prefer simpler approach** - REI values boring over clever
5. **Ask before adding features** - scope is deliberately constrained

## Success Criteria

REIVM v0.1.0 is complete when:
1. All "Must Have" features implemented
2. Test suite passes in Bun
3. Example runs in browser
4. TypeScript builds without errors
5. Code follows all REI design principles
6. Implementation matches REIVM component spec
