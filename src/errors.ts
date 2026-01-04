/**
 * Base error class for all REIVM errors.
 * Provides structured error information with type and optional context.
 */
export class REIError extends Error {
  /**
   * @param message - Human-readable error description
   * @param type - Error type identifier for programmatic handling
   * @param context - Optional additional context about the error
   */
  constructor(
    message: string,
    public type: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'REIError';
  }
}

/**
 * Thrown when attempting to push to a full stack.
 * Stack has a maximum depth (default 256) to prevent unbounded growth.
 */
export class StackOverflowError extends REIError {
  constructor() {
    super('Stack overflow', 'STACK_OVERFLOW');
  }
}

/**
 * Thrown when attempting to pop or peek from an empty stack.
 */
export class StackUnderflowError extends REIError {
  constructor() {
    super('Stack underflow', 'STACK_UNDERFLOW');
  }
}

/**
 * Thrown when attempting to execute a word that doesn't exist in the dictionary.
 */
export class WordNotFoundError extends REIError {
  constructor(name: string) {
    super(`Word not found: ${name}`, 'WORD_NOT_FOUND', { word: name });
  }
}

/**
 * Thrown when control flow structures are malformed or incorrectly used.
 * Examples: IF without THEN, mismatched loop constructs, etc.
 */
export class ControlFlowError extends REIError {
  constructor(message: string) {
    super(message, 'CONTROL_FLOW_ERROR');
  }
}
