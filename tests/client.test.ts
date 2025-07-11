/**
 * Basic tests for the HelpingAI client
 */

import { HAI, NoAPIKeyError } from '../src/index';

// Jest type declarations
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const beforeEach: any;
declare const process: any;

describe('HAI Client', () => {
  describe('Constructor', () => {
    test('should throw NoAPIKeyError when no API key is provided', () => {
      // Clear environment variable for this test
      const originalEnv = process.env.HAI_API_KEY;
      delete process.env.HAI_API_KEY;

      expect(() => {
        new HAI();
      }).toThrow(NoAPIKeyError);

      // Restore environment variable
      if (originalEnv) {
        process.env.HAI_API_KEY = originalEnv;
      }
    });

    test('should accept API key from options', () => {
      expect(() => {
        new HAI({ apiKey: 'test-key' });
      }).not.toThrow();
    });

    test('should accept API key from environment variable', () => {
      process.env.HAI_API_KEY = 'test-env-key';
      
      expect(() => {
        new HAI();
      }).not.toThrow();
    });

    test('should use custom configuration options', () => {
      const client = new HAI({
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com/v1',
        timeout: 30000,
        organization: 'test-org'
      });

      expect(client).toBeInstanceOf(HAI);
    });
  });

  describe('Client Properties', () => {
    let client: HAI;

    beforeEach(() => {
      client = new HAI({ apiKey: 'test-key' });
    });

    test('should have chat property', () => {
      expect(client.chat).toBeDefined();
      expect(client.chat.completions).toBeDefined();
    });

    test('should have models property', () => {
      expect(client.models).toBeDefined();
    });
  });
});
