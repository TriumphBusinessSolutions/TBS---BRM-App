export type ZodIssue = {
  path: Array<string | number>;
  message: string;
};

export class ZodError extends Error {
  issues: ZodIssue[];

  constructor(issues: ZodIssue[]) {
    super("Validation error");
    this.issues = issues;
  }
}

export const ZodIssueCode = {
  custom: "custom",
} as const;

type ParserResult<T> = { success: true; data: T } | { success: false; issues: ZodIssue[] };
type Parser<T> = (value: unknown, path: Array<string | number>) => ParserResult<T>;

type RefinementCtx = {
  addIssue: (issue: { path?: Array<string | number>; message: string }) => void;
};

class Schema<T> {
  protected readonly parser: Parser<T>;

  constructor(parser: Parser<T>) {
    this.parser = parser;
  }

  safeParse(value: unknown): { success: true; data: T } | { success: false; error: ZodError } {
    const result = this.parser(value, []);
    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: new ZodError(result.issues) };
  }

  parseInternal(value: unknown, path: Array<string | number>): ParserResult<T> {
    return this.parser(value, path);
  }

  nullable(): Schema<T | null> {
    const baseParser = this.parser;
    return new Schema<T | null>((value, path) => {
      if (value === null) {
        return { success: true, data: null };
      }

      return baseParser(value, path);
    });
  }

  or<U>(other: Schema<U>): Schema<T | U> {
    const baseParser = this.parser;
    return new Schema<T | U>((value, path) => {
      const first = baseParser(value, path);
      if (first.success) {
        return first as unknown as ParserResult<T | U>;
      }

      const second = other.parseInternal(value, path);
      if (second.success) {
        return second as unknown as ParserResult<T | U>;
      }

      return { success: false, issues: [...first.issues, ...second.issues] };
    });
  }

  superRefine(refinement: (data: T, ctx: RefinementCtx) => void): Schema<T> {
    const baseParser = this.parser;
    return new Schema<T>((value, path) => {
      const result = baseParser(value, path);
      if (!result.success) {
        return result;
      }

      const issues: ZodIssue[] = [];
      refinement(result.data, {
        addIssue(issue) {
          issues.push({
            path: issue.path ? [...path, ...issue.path] : [...path],
            message: issue.message,
          });
        },
      });

      if (issues.length > 0) {
        return { success: false, issues };
      }

      return result;
    });
  }
}

class StringSchema extends Schema<string> {
  constructor(parser?: Parser<string>) {
    super(
      parser ??
        ((value, path) =>
          typeof value === "string"
            ? { success: true, data: value }
            : { success: false, issues: [{ path, message: "Expected string" }] }),
    );
  }

  min(length: number, message: string): StringSchema {
    const baseParser = this.parser;
    return new StringSchema((value, path) => {
      const result = baseParser(value, path);
      if (!result.success) {
        return result;
      }

      if (result.data.length < length) {
        return { success: false, issues: [{ path, message }] };
      }

      return result;
    });
  }

  max(length: number, message: string): StringSchema {
    const baseParser = this.parser;
    return new StringSchema((value, path) => {
      const result = baseParser(value, path);
      if (!result.success) {
        return result;
      }

      if (result.data.length > length) {
        return { success: false, issues: [{ path, message }] };
      }

      return result;
    });
  }
}

class NumberSchema extends Schema<number> {
  constructor(parser?: Parser<number>) {
    super(
      parser ??
        ((value, path) =>
          typeof value === "number" && Number.isFinite(value)
            ? { success: true, data: value }
            : { success: false, issues: [{ path, message: "Expected number" }] }),
    );
  }

  nonnegative(message: string): NumberSchema {
    const baseParser = this.parser;
    return new NumberSchema((value, path) => {
      const result = baseParser(value, path);
      if (!result.success) {
        return result;
      }

      if (result.data < 0) {
        return { success: false, issues: [{ path, message }] };
      }

      return result;
    });
  }
}

class BooleanSchema extends Schema<boolean> {
  constructor() {
    super((value, path) =>
      typeof value === "boolean"
        ? { success: true, data: value }
        : { success: false, issues: [{ path, message: "Expected boolean" }] },
    );
  }
}

type EnumValues<T extends readonly [string, ...string[]]> = T[number];

class EnumSchema<T extends readonly [string, ...string[]]> extends Schema<EnumValues<T>> {
  constructor(private readonly values: T) {
    super((value, path) => {
      if (typeof value !== "string") {
        return { success: false, issues: [{ path, message: "Expected string" }] };
      }

      if (!values.includes(value as EnumValues<T>)) {
        return { success: false, issues: [{ path, message: "Invalid enum value" }] };
      }

      return { success: true, data: value as EnumValues<T> };
    });
  }
}

class LiteralSchema<T> extends Schema<T> {
  constructor(private readonly literal: T) {
    super((value, path) =>
      value === literal
        ? { success: true, data: literal }
        : { success: false, issues: [{ path, message: `Expected ${String(literal)}` }] },
    );
  }
}

type Shape = Record<string, Schema<any>>;
type InferShape<S extends Shape> = { [K in keyof S]: S[K] extends Schema<infer R> ? R : never };

class ObjectSchema<S extends Shape> extends Schema<InferShape<S>> {
  private readonly shape: S;

  constructor(shape: S, parser?: Parser<InferShape<S>>) {
    const baseParser: Parser<InferShape<S>> = (value, path) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { success: false, issues: [{ path, message: "Expected object" }] };
      }

      const entries = value as Record<string, unknown>;
      const result: Partial<InferShape<S>> = {};
      const issues: ZodIssue[] = [];

      for (const key of Object.keys(shape) as Array<keyof S>) {
        const schema = shape[key];
        const fieldResult = schema.parseInternal(entries[key as string], [...path, key as string]);
        if (fieldResult.success) {
          (result as any)[key] = fieldResult.data;
        } else {
          issues.push(...fieldResult.issues);
        }
      }

      if (issues.length > 0) {
        return { success: false, issues };
      }

      return { success: true, data: result as InferShape<S> };
    };

    super(parser ?? baseParser);
    this.shape = shape;
  }
}

class ArraySchema<T> extends Schema<T[]> {
  private readonly itemSchema: Schema<T>;

  constructor(itemSchema: Schema<T>, parser?: Parser<T[]>) {
    const baseParser: Parser<T[]> = (value, path) => {
      if (!Array.isArray(value)) {
        return { success: false, issues: [{ path, message: "Expected array" }] };
      }

      const results: T[] = [];
      const issues: ZodIssue[] = [];

      value.forEach((item, index) => {
        const elementResult = itemSchema.parseInternal(item, [...path, index]);
        if (elementResult.success) {
          results.push(elementResult.data);
        } else {
          issues.push(...elementResult.issues);
        }
      });

      if (issues.length > 0) {
        return { success: false, issues };
      }

      return { success: true, data: results };
    };

    super(parser ?? baseParser);
    this.itemSchema = itemSchema;
  }

  length(size: number, message: string): ArraySchema<T> {
    const baseParser = this.parser;
    return new ArraySchema<T>(this.itemSchema, (value, path) => {
      const result = baseParser(value, path);
      if (!result.success) {
        return result;
      }

      if (result.data.length !== size) {
        return { success: false, issues: [{ path, message }] };
      }

      return result;
    });
  }
}

class UnionSchema<T extends Schema<any>[]> extends Schema<T[number] extends Schema<infer R> ? R : never> {
  constructor(private readonly schemas: T) {
    super((value, path) => {
      const issues: ZodIssue[] = [];
      for (const schema of schemas) {
        const result = schema.parseInternal(value, path);
        if (result.success) {
          return result as ParserResult<any>;
        }

        issues.push(...result.issues);
      }

      return { success: false, issues };
    });
  }
}

export type Infer<T extends Schema<any>> = T extends Schema<infer R> ? R : never;

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: <T extends readonly [string, ...string[]]>(values: T) => new EnumSchema(values),
  literal: <T>(value: T) => new LiteralSchema(value),
  object: <S extends Shape>(shape: S) => new ObjectSchema(shape),
  array: <S extends Schema<any>>(schema: S) => new ArraySchema(schema),
  union: <T extends Schema<any>[]>(schemas: T) => new UnionSchema(schemas),
  ZodIssueCode,
};

export type { Schema };
