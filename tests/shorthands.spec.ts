/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { throwError, tryCatch, withThis } from '@lib/shorthands';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Shorthands', () => {
  describe('throwError', () => {
    it('should throw an error', () => {
      const error = new Error('Test error');
      expect(() => throwError(error)).toThrowError(error);
    });
  });

  describe('tryCatch', () => {
    it('should return the result of the function', () => {
      const result = tryCatch(() => 'success');
      expect(result).toStrictEqual({ success: true, data: 'success' });
    });

    it('should return the result of the promise', async () => {
      const result = await tryCatch(() => new Promise(resolve => setTimeout(() => resolve('success'), 10)));
      expect(result).toStrictEqual({ success: true, data: 'success' });
    });

    it('should return the error if the function throws an error', () => {
      const error = new Error('Test error');
      const result = tryCatch(() => throwError(error));
      expect(result).toStrictEqual({ success: false, error });
    });

    it('should return the error if the promise rejects', async () => {
      const error = new Error('Test error');
      const result = await tryCatch(() => new Promise((_, reject) => setTimeout(() => reject(error), 10)));
      expect(result).toStrictEqual({ success: false, error });
    });
  });

  describe('withThis', () => {
    class Person {
      constructor(public name: string) {}
      greetWithMessage = withThis((context: Person, message: string) => `${message}, I am ${context.name}`);
      greet = withThis((context: Person) => `Hello, ${context.name}!`);
    }

    it('calls function with context as the first argument', () => {
      const person = new Person('Alice');
      expect(person.greet()).toBe('Hello, Alice!');
    });

    it('maintains additional arguments passed to the function', () => {
      const person = new Person('Bob');
      expect(person.greetWithMessage('Yolo')).toBe('Yolo, I am Bob');
    });
  });
});
