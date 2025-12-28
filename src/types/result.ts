/**
 * Result type for handling success/failure without exceptions
 * Follows the Result pattern common in Rust and functional programming
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly value: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export const Result = {
  ok<T>(value: T): Success<T> {
    return { success: true, value };
  },

  err<E>(error: E): Failure<E> {
    return { success: false, error };
  },

  isOk<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true;
  },

  isErr<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false;
  },

  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (Result.isOk(result)) {
      return Result.ok(fn(result.value));
    }
    return result;
  },

  mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (Result.isErr(result)) {
      return Result.err(fn(result.error));
    }
    return result;
  },

  unwrap<T, E>(result: Result<T, E>): T {
    if (Result.isOk(result)) {
      return result.value;
    }
    throw result.error;
  },

  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (Result.isOk(result)) {
      return result.value;
    }
    return defaultValue;
  },

  async fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await promise;
      return Result.ok(value);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  },
};
