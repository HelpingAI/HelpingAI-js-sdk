/**
 * Tests for error handling functionality
 */

import {
  HAIError,
  AuthenticationError,
  NoAPIKeyError,
  InvalidAPIKeyError,
  InvalidRequestError,
  InvalidModelError,
  RateLimitError,
  TooManyRequestsError,
  ServiceUnavailableError,
  TimeoutError,
  APIConnectionError,
  APIError,
  ServerError,
  ContentFilterError
} from '../src/index';

// Jest type declarations
declare const describe: any;
declare const test: any;
declare const expect: any;

describe('Error Classes', () => {
  describe('HAIError', () => {
    test('should create base error with message', () => {
      const error = new HAIError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('HAIError');
    });

    test('should include status code and headers', () => {
      const headers = { 'content-type': 'application/json' };
      const error = new HAIError('Test error', {
        statusCode: 400,
        headers
      });

      expect(error.statusCode).toBe(400);
      expect(error.headers).toEqual(headers);
    });

    test('should format toString with status code', () => {
      const error = new HAIError('Test error', { statusCode: 400 });
      expect(error.toString()).toBe('Test error (HTTP 400)');
    });
  });

  describe('NoAPIKeyError', () => {
    test('should create error with default message', () => {
      const error = new NoAPIKeyError();
      expect(error.name).toBe('NoAPIKeyError');
      expect(error.message).toContain('No API key provided');
    });
  });

  describe('InvalidAPIKeyError', () => {
    test('should create error with default message', () => {
      const error = new InvalidAPIKeyError();
      expect(error.name).toBe('InvalidAPIKeyError');
      expect(error.message).toContain('Invalid API key');
    });
  });

  describe('InvalidRequestError', () => {
    test('should include parameter and code information', () => {
      const error = new InvalidRequestError('Invalid parameter', {
        param: 'model',
        code: 'invalid_value'
      });

      expect(error.param).toBe('model');
      expect(error.code).toBe('invalid_value');
      expect(error.toString()).toContain('Parameter: model');
      expect(error.toString()).toContain('Error Code: invalid_value');
    });
  });

  describe('InvalidModelError', () => {
    test('should create error with model name', () => {
      const error = new InvalidModelError('gpt-invalid');
      expect(error.message).toContain("Model 'gpt-invalid' not found");
      expect(error.param).toBe('model');
    });
  });

  describe('RateLimitError', () => {
    test('should extract retry-after from headers', () => {
      const error = new RateLimitError(
        'Rate limit exceeded',
        429,
        { 'retry-after': '60' }
      );

      expect(error.retryAfter).toBe(60);
      expect(error.toString()).toContain('Retry after: 60 seconds');
    });

    test('should handle missing retry-after header', () => {
      const error = new RateLimitError('Rate limit exceeded', 429, {});
      expect(error.retryAfter).toBeUndefined();
    });
  });

  describe('APIError', () => {
    test('should include code and type in toString', () => {
      const error = new APIError(
        'API error',
        'internal_error',
        'server_error',
        500
      );

      expect(error.code).toBe('internal_error');
      expect(error.type).toBe('server_error');
      expect(error.toString()).toContain('Code: internal_error');
      expect(error.toString()).toContain('Type: server_error');
    });
  });

  describe('APIConnectionError', () => {
    test('should indicate whether retry is recommended', () => {
      const error = new APIConnectionError('Connection failed', true);
      expect(error.shouldRetry).toBe(true);
    });
  });
});
