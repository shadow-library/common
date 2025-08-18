/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type MaybeArray<T> = T | T[];

export type MaybeNull<T> = T | null;

export type MaybeUndefined<T> = T | undefined;

export type Nullable<T> = T | null | undefined;

export type SyncValue<T = unknown> = T extends Promise<any> ? never : T;
