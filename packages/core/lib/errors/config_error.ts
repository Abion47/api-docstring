export default class ConfigError extends Error {
  constructor(message: string) {
    super(message);

    // enable stack trace
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}
