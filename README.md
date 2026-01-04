# REIVM

## REI Design Reference

REIVM implements the virtual machine as specified in the [REI Framework](https://github.com/rei-project/REI).
The specification is in [SPEC.md](./SPEC.md)

**Required reading for contributors:**
1. [REI Manifesto](https://github.com/rei-project/REI/blob/main/MANIFESTO.md) - The philosophical foundation
2. [Design Principles](https://github.com/rei-project/REI/blob/main/PRINCIPLES.md) - How to make decisions
3. [Technical Specifications](https://github.com/rei-project/REI/blob/main/SPECIFICATIONS.md) - What must be true
4. [Conceptual REIVM Component Spec](https://github.com/rei-project/REI/blob/main/components/REIVM.md) - This component's requirements

When implementing, LLMs should reference these documents to ensure consistency with REI's design philosophy.

## Running REIVM (from empty Bun template)

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
