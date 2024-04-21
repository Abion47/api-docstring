export type Logger = {
  level: 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  debug: (...args: unknown[]) => void;
  verbose: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};
