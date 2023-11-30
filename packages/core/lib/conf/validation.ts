import ConfigError from '../errors/config_error';

export function validateString(name: string, field: unknown): string;
export function validateString(name: string, field: unknown, nullable: boolean): string | undefined;
export function validateString(name: string, field: unknown, nullable = false): string | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (typeof field === 'string') return field;
  throw new ConfigError(`Field ${name} must be a string. Found: ${field}`);
}

export function validateBool(name: string, field: unknown): boolean;
export function validateBool(name: string, field: unknown, nullable: boolean): boolean | undefined;
export function validateBool(name: string, field: unknown, nullable = false): boolean | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (typeof field === 'boolean') return field;
  throw new ConfigError(`Field ${name} must be a boolean. Found: ${field}`);
}

export function validateNumber(name: string, field: unknown): number;
export function validateNumber(name: string, field: unknown, nullable: boolean): number | undefined;
export function validateNumber(name: string, field: unknown, nullable = false): number | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (typeof field === 'number') return field;
  throw new ConfigError(`Field ${name} must be a number. Found: ${field}`);
}

export function validateInteger(name: string, field: unknown): number;
export function validateInteger(name: string, field: unknown, nullable: boolean): number | undefined;
export function validateInteger(name: string, field: unknown, nullable = false): number | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (typeof field === 'number') {
    if (Math.floor(field) === field) return field;
    throw new ConfigError(`Field ${name} must be an integer. Found: ${field}`);
  }
  throw new ConfigError(`Field ${name} must be a number. Found: ${field}`);
}

export function validateArray(name: string, field: unknown): unknown[];
export function validateArray(name: string, field: unknown, nullable: boolean): unknown[] | undefined;
export function validateArray(name: string, field: unknown, nullable = false): unknown[] | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (Array.isArray(field)) return field;
  throw new ConfigError(`Field ${name} must be an array. Found: ${field}`);
}

export function validateArrayItems<T>(
  name: string,
  field: unknown[],
  predicate: (name: string, value: unknown, nullable: boolean) => T
): T[];
export function validateArrayItems<T>(
  name: string,
  field: unknown[],
  predicate: (name: string, value: unknown, nullable: boolean) => T | undefined,
  nullable: boolean
): (T | undefined)[];
export function validateArrayItems<T>(
  name: string,
  field: unknown[],
  predicate: (name: string, value: unknown, nullable: boolean) => T | undefined,
  nullable = false
): (T | undefined)[] {
  if (field == null) {
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  for (const item of field) {
    try {
      predicate(name, item, nullable);
    } catch {
      throw new ConfigError(`All items of field ${name} must be of an expected type. Found ${item}.`);
    }
  }
  return field as (T | undefined)[];
}

export function validateObject(name: string, field: unknown): Record<string, unknown>;
export function validateObject(name: string, field: unknown, nullable: boolean): Record<string, unknown> | undefined;
export function validateObject(name: string, field: unknown, nullable = false): Record<string, unknown> | undefined {
  if (field == null) {
    if (nullable === true) return undefined;
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  if (typeof field === 'object') return field as Record<string, undefined>;
  throw new ConfigError(`Field ${name} must be an object. Found: ${field}`);
}

export function validateUnion<T>(name: string, field: unknown, values: T[]): T {
  if (field == null) {
    throw new ConfigError(`Field ${name} must not be null.`);
  }
  for (const value of values) {
    if (field === value) return field as T;
  }
  throw new ConfigError(`Field ${name} must be one of ${values}. Found: ${field}`);
}
