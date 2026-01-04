# REI Session Architecture

**Context**: This document explores session state, source loading, and branching semantics for REIVM.

---

## The Problem

REI needs to support multiple interaction models:

1. **Source Loading**: Read REI source code and compile it into the dictionary
2. **Session Persistence**: Save and restore the state of a VM
3. **Branching**: Fork a VM to explore multiple paths
4. **Convergence**: Compare/merge/choose between branches

These are **different concerns** with different responsibilities.

---

## Proposed Architecture

### Layer 1: REIVM Core (v0.1.0)

**Responsibility**: Single VM execution and state management

**API**:
```typescript
class VM {
  // Current API (already in SPEC.md)
  serialize(): VMState;
  deserialize(state: VMState): void;
  
  // Addition: Cloning support
  clone(): VM;
}
```

**Semantics**:
- `serialize()` captures complete VM state (stack + dictionary + config)
- `deserialize()` restores VM to saved state
- `clone()` creates independent copy of current VM (deep copy)

**What REIVM doesn't do**:
- Parse source files (that's REILOADER)
- Manage multiple VMs (that's REISESSION or orchestrator)
- Compare/merge states (that's orchestration layer)

---

### Layer 2: REILOADER (Future Component)

**Responsibility**: Parse REI source code and load into VM

**API** (conceptual):
```typescript
class REILoader {
  constructor(vm: VM);
  
  // Load source code
  loadSource(source: string): LoadResult;
  loadFile(path: string): Promise<LoadResult>;
  
  // Parse without executing (for validation)
  parse(source: string): ParsedWord[];
  validate(parsed: ParsedWord[]): ValidationResult;
}

interface LoadResult {
  success: boolean;
  wordsLoaded: string[];
  errors?: ParseError[];
}
```

**Semantics**:
- Parses REI source (word definitions, comments, etc.)
- Validates syntax and stack effects
- Adds definitions to VM's dictionary
- Reports success/errors

**Source Format** (example):
```rei
\ Comment: Define SQUARE word
: SQUARE ( n -- n² )
  DUP * ;

\ Comment: Define CUBE word
: CUBE ( n -- n³ )
  DUP SQUARE * ;

\ These execute immediately (not definitions)
5 SQUARE .
```

**Not in v0.1.0** - REIVM uses programmatic API first. REILOADER comes later when we have syntax to parse.

---

### Layer 3: Session Management (Architecture Pattern)

**Responsibility**: Orchestration of multiple VM instances

**Not a component** - this is a pattern that applications/LLMs can implement.

**Example: Simple Session Manager**:
```typescript
class REISession {
  private baseVM: VM;
  private branches: Map<string, VM>;
  
  constructor(baseState?: VMState) {
    this.baseVM = baseState 
      ? VM.deserialize(baseState)
      : bootstrapVM();
    this.branches = new Map();
  }
  
  // Create branch from current base state
  createBranch(name: string): VM {
    const branch = this.baseVM.clone();
    this.branches.set(name, branch);
    return branch;
  }
  
  // Get branch for work
  getBranch(name: string): VM | undefined {
    return this.branches.get(name);
  }
  
  // Promote branch to base (choose this path)
  promoteBranch(name: string): void {
    const branch = this.branches.get(name);
    if (!branch) throw new Error(`Branch not found: ${name}`);
    
    this.baseVM = branch.clone();
    this.branches.clear(); // Discard other branches
  }
  
  // Compare branches
  compareBranches(name1: string, name2: string): BranchComparison {
    const b1 = this.branches.get(name1);
    const b2 = this.branches.get(name2);
    
    if (!b1 || !b2) throw new Error('Branch not found');
    
    return {
      branch1: { stack: b1.inspectStack(), words: b1.inspectDictionary() },
      branch2: { stack: b2.inspectStack(), words: b2.inspectDictionary() },
      differences: this.diffStates(b1, b2)
    };
  }
  
  // Save entire session (base + all branches)
  serializeSession(): SessionState {
    return {
      base: this.baseVM.serialize(),
      branches: Array.from(this.branches.entries()).map(([name, vm]) => ({
        name,
        state: vm.serialize()
      }))
    };
  }
  
  // Restore session
  static deserializeSession(state: SessionState): REISession {
    const session = new REISession(state.base);
    for (const branch of state.branches) {
      const vm = new VM();
      vm.deserialize(branch.state);
      session.branches.set(branch.name, vm);
    }
    return session;
  }
  
  private diffStates(vm1: VM, vm2: VM): StateDiff {
    // Implementation compares dictionaries, stacks, etc.
    // Returns structured diff
  }
}

interface SessionState {
  base: VMState;
  branches: Array<{
    name: string;
    state: VMState;
  }>;
}
```

---

## Usage Examples

### Example 1: Simple Session Save/Restore

```typescript
import { bootstrapVM } from '@rei-project/reivm';

// Create VM and do work
const vm = bootstrapVM();
vm.run('5 3 +');

// Save state
const state = vm.serialize();
localStorage.setItem('my-session', JSON.stringify(state));

// Later: restore
const savedState = JSON.parse(localStorage.getItem('my-session'));
const vm2 = new VM();
vm2.deserialize(savedState);

// Continue where we left off
vm2.run('DUP *'); // Square the 8
```

### Example 2: Branching for Exploration

```typescript
import { bootstrapVM } from '@rei-project/reivm';

// Start with base VM
const base = bootstrapVM();
base.run('5 3'); // Stack: [5, 3]

// Fork to try addition
const addPath = base.clone();
addPath.run('+'); // Stack: [8]
console.log('Add result:', addPath.dataStack.peek()); // 8

// Fork to try multiplication
const mulPath = base.clone();
mulPath.run('*'); // Stack: [15]
console.log('Mul result:', mulPath.dataStack.peek()); // 15

// Original base unchanged
console.log('Base stack:', base.dataStack.snapshot()); // [5, 3]
```

### Example 3: LLM-Driven Exploration

```typescript
// Orchestrator (could be in REIMON or separate tool)
class ExplorationOrchestrator {
  async explorePaths(llm: LLM, baseVM: VM, prompt: string) {
    const approaches = await llm.generateApproaches(prompt);
    const results: Map<string, VM> = new Map();
    
    for (const approach of approaches) {
      const branch = baseVM.clone();
      try {
        branch.run(approach.code);
        results.set(approach.name, branch);
      } catch (error) {
        console.log(`Approach ${approach.name} failed:`, error);
      }
    }
    
    // Compare results
    const comparison = this.compareResults(results);
    
    // Ask LLM to choose best
    const choice = await llm.chooseBest(comparison);
    
    return results.get(choice);
  }
  
  compareResults(results: Map<string, VM>): Comparison {
    return {
      stackStates: Array.from(results.entries()).map(([name, vm]) => ({
        name,
        stack: vm.inspectStack()
      })),
      newWords: Array.from(results.entries()).map(([name, vm]) => ({
        name,
        words: vm.inspectDictionary().words.filter(w => w.category === 'USER')
      }))
    };
  }
}
```

### Example 4: Session with Source Loading (Future)

```typescript
import { bootstrapVM } from '@rei-project/reivm';
import { REILoader } from '@rei-project/reiloader'; // Future

// Create session
const vm = bootstrapVM();
const loader = new REILoader(vm);

// Load standard library
await loader.loadFile('./stdlib.rei');

// Load application code
const result = loader.loadSource(`
  : FIBONACCI ( n -- fib )
    DUP 2 < IF EXIT THEN
    DUP 1 - FIBONACCI
    SWAP 2 - FIBONACCI
    + ;
`);

if (result.success) {
  vm.run('10 FIBONACCI'); // Calculate 10th Fibonacci number
}

// Save session including loaded libraries
const state = vm.serialize();
```

---

## What Goes in REIVM v0.1.0

**Already in SPEC.md**:
- `serialize()` / `deserialize()` - session persistence
- `VMState` type - serialized format

**Should add**:
- `clone()` method - deep copy for branching

**Implementation**:
```typescript
// src/vm.ts

export class VM {
  // ... existing methods ...
  
  /**
   * Create an independent copy of this VM.
   * Changes to the clone will not affect the original.
   * 
   * @returns A new VM instance with copied state
   * 
   * @example
   * ```typescript
   * const vm1 = bootstrapVM();
   * vm1.run('5 3 +');
   * 
   * const vm2 = vm1.clone();
   * vm2.run('DUP *'); // Square it
   * 
   * console.log(vm1.dataStack.peek()); // 8 (original)
   * console.log(vm2.dataStack.peek()); // 64 (cloned)
   * ```
   */
  clone(): VM {
    const state = this.serialize();
    const newVM = new VM(this.config);
    newVM.deserialize(state);
    return newVM;
  }
}
```

**Test**:
```typescript
// tests/vm.test.ts

test('clone creates independent VM', () => {
  const vm1 = bootstrapVM();
  vm1.dataStack.push(42);
  
  const vm2 = vm1.clone();
  vm2.dataStack.push(99);
  
  expect(vm1.dataStack.depth()).toBe(1);
  expect(vm2.dataStack.depth()).toBe(2);
  expect(vm1.dataStack.peek()).toBe(42);
  expect(vm2.dataStack.peek()).toBe(99);
});

test('clone includes dictionary state', () => {
  const vm1 = bootstrapVM();
  vm1.dictionary.define('TEST', {
    name: 'TEST',
    stackEffect: '( -- )',
    body: [],
    immediate: false,
    category: 'USER',
    metadata: { defined: new Date(), usageCount: 0 }
  });
  
  const vm2 = vm1.clone();
  
  expect(vm2.dictionary.find('TEST')).not.toBeNull();
  expect(vm2.dictionary.find('TEST')?.name).toBe('TEST');
});
```

---

## What We're NOT Building (Yet)

### NOT in v0.1.0:

**REILOADER** - Source file parsing
- Reason: Need to define source syntax first
- Alternative: Use programmatic API (vm.dictionary.define)

**REISession** - Multi-VM orchestration  
- Reason: Pattern, not component
- Alternative: Applications build their own using vm.clone()

**Branch comparison tools**
- Reason: Application-specific needs
- Alternative: Use vm.inspectStack() / vm.inspectDictionary()

**Source-level diff/merge**
- Reason: Complex, not needed yet
- Alternative: Serialize states and compare JSON

---

## Design Principles Applied

**From REI Manifesto**:

> Virtual Machines Are Boundaries of Meaning

REIVM is responsible for:
✅ Single VM execution correctness  
✅ Observable state  
✅ Serialization/deserialization  
✅ Cloning support  

REIVM is NOT responsible for:
❌ Multi-VM orchestration (that's above the boundary)  
❌ Source file formats (that's outside the boundary)  
❌ Branch selection logic (that's application domain)

> Simplicity Is a Survival Strategy

- `clone()` is simple: serialize + deserialize
- No complex branch tracking in VM itself
- Applications compose VMs as needed
- Each layer has clear responsibility

---

## Migration Path

**v0.1.0**: REIVM with clone() support
- Applications orchestrate manually
- Sessions are just serialized VMState

**v0.2.0**: REILOADER component
- Define REI source syntax
- Parser implementation
- Syntax validation

**v0.3.0**: Session management patterns
- Document REISession pattern
- Example implementations
- Testing utilities for multi-VM scenarios

**v1.0.0**: Mature ecosystem
- REIVM: stable, tested, fast
- REIMON: full MCP integration
- REILOADER: syntax finalized
- REIWORD: comprehensive standard library
- Applications demonstrate branching patterns

---

## For Claude Code

When implementing REIVM v0.1.0:

1. **Add `clone()` method** to VM class
2. **Ensure deep copies** in clone (especially dictionary)
3. **Test independence** of cloned VMs
4. **Document cloning** for branching use cases

Do NOT implement:
- Source parsing (future: REILOADER)
- Multi-VM management (application responsibility)
- Branch comparison logic (application responsibility)

The VM's job is to be **clonable** and **serializable**. Everything else composes on top.

---

## Questions This Raises

### Q: Should serialize() include CORE words?

**A**: No. CORE words are bootstrapped from code, not serialized state.

When deserializing, application must bootstrap fresh VM then apply state:
```typescript
const vm = bootstrapVM(); // Loads CORE words
vm.deserialize(userState); // Loads USER words + stack
```

### Q: Should clone() preserve trace state?

**A**: No. Traces are debugging artifacts, not VM state. Fresh clone = clean trace.

### Q: What about return stack in serialize/clone?

**A**: v0.1.0 doesn't implement control flow, so return stack is empty. When control flow is added (v0.2), include return stack in serialize/clone.

### Q: Should there be a "checkpoint" mechanism separate from serialize?

**A**: Not needed. `clone()` serves as implicit checkpoint:
```typescript
const checkpoint = vm.clone(); // Checkpoint
vm.run('risky code');
if (failed) {
  vm = checkpoint; // Restore
}
```

### Q: Should VMs have IDs for tracking?

**A**: Not in REIVM. Applications can assign IDs if needed:
```typescript
class TrackedVM {
  id: string;
  vm: VM;
}
```

---

## Summary

**REIVM's responsibility**: Single VM correctness + clonable state  
**Application's responsibility**: Orchestration, comparison, branching logic  
**Future component (REILOADER)**: Source parsing and loading  

**v0.1.0 addition**: Add `vm.clone()` method with full test coverage

This keeps REIVM simple and composable while enabling powerful orchestration patterns above it.

---

*The VM is the atom. Sessions and branches are molecules built from atoms.*
