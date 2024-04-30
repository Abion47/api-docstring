export default class WorkerError extends Error {
  file: unknown;
  block: unknown;
  element: unknown;
  definition: unknown;
  example: unknown;
  extra: unknown;

  constructor(
    message: string,
    file: unknown,
    block: unknown,
    element: unknown,
    definition: unknown,
    example: unknown,
    extra: unknown
  ) {
    super(message);

    // enable stack trace
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;

    this.file = file;
    this.block = block;
    this.element = element;
    this.definition = definition;
    this.example = example;
    this.extra = extra || [];
  }
}
