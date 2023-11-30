import fpath from 'path';

export default class FileError extends Error {
  file: string;
  path: string;

  constructor(message: string, file?: string, path?: string) {
    super(message);

    // enable stack trace
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;

    this.file = file || '';
    this.path = path || this.file;

    if (this.path && this.path.charAt(this.path.length - 1) !== '/') {
      this.path = fpath.dirname(this.path);
    }
  }
}
