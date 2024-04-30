export default class ParameterError extends Error {
  element: unknown;
  definition: unknown;
  example: unknown;

  constructor(message: string, element: unknown, definition: unknown, example: unknown) {
    super(message);

    // enable stack trace
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;

    this.element = element;
    this.definition = definition;
    this.example = example;
  }
}
