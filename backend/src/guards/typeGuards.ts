export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;