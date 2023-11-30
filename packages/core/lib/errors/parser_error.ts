export default class ParserError extends Error {
  file: string;
  block: string;
  element: string;
  source: unknown;
  extra: unknown;

  constructor(message: string, file: string, block: string, element: string, source?: unknown, extra?: unknown) {
    super(message);

    // enable stack trace
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;

    this.file = file;
    this.block = block;
    this.element = element;
    this.source = source;
    this.extra = extra || [];
  }
}
