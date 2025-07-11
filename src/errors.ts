/**
 * Base error class for all HelpingAI API errors.
 */
export class HAIError extends Error {
  public readonly statusCode?: number;
  public readonly headers?: Record<string, string>;
  public readonly body?: any;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    super(message);
    this.name = 'HAIError';
    this.statusCode = options.statusCode;
    this.headers = options.headers;
    this.body = options.body;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HAIError);
    }
  }

  toString(): string {
    const status = this.statusCode ? ` (HTTP ${this.statusCode})` : '';
    return `${this.message}${status}`;
  }
}

/**
 * Raised when API key authentication fails.
 */
export class AuthenticationError extends HAIError {
  constructor(message: string, options?: { statusCode?: number; headers?: Record<string, string> }) {
    super(message, options);
    this.name = 'AuthenticationError';
  }
}

/**
 * Raised when no API key is provided.
 */
export class NoAPIKeyError extends AuthenticationError {
  constructor() {
    super(
      'No API key provided. Set your API key using `new HAI({ apiKey: "..." })` ' +
      'or by setting the HAI_API_KEY environment variable. You can generate API keys ' +
      'in the HelpingAI dashboard at https://helpingai.co/dashboard'
    );
    this.name = 'NoAPIKeyError';
  }
}

/**
 * Raised when the API key is invalid.
 */
export class InvalidAPIKeyError extends AuthenticationError {
  constructor(statusCode?: number, headers?: Record<string, string>) {
    super(
      'Invalid API key. Check your API key at https://helpingai.co/dashboard',
      { statusCode, headers }
    );
    this.name = 'InvalidAPIKeyError';
  }
}

/**
 * Raised when the API key doesn't have permission for the requested operation.
 */
export class PermissionDeniedError extends AuthenticationError {
  constructor(message: string = 'Permission denied', options?: { statusCode?: number; headers?: Record<string, string> }) {
    super(message, options);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Raised when the request parameters are invalid.
 */
export class InvalidRequestError extends HAIError {
  public readonly param?: string;
  public readonly code?: string;

  constructor(
    message: string,
    options: {
      param?: string;
      code?: string;
      statusCode?: number;
      headers?: Record<string, string>;
    } = {}
  ) {
    super(message, options);
    this.name = 'InvalidRequestError';
    this.param = options.param;
    this.code = options.code;
  }

  toString(): string {
    let msg = super.toString();
    if (this.param) {
      msg = `${msg} (Parameter: ${this.param})`;
    }
    if (this.code) {
      msg = `${msg} (Error Code: ${this.code})`;
    }
    return msg;
  }
}

/**
 * Raised when an invalid model is specified.
 */
export class InvalidModelError extends InvalidRequestError {
  constructor(
    model: string,
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(
      `Model '${model}' not found. Available models can be found at ` +
      'https://api.helpingai.co/v1/models',
      {
        param: 'model',
        statusCode,
        headers
      }
    );
    this.name = 'InvalidModelError';
  }
}

/**
 * Raised when rate limit is exceeded.
 */
export class RateLimitError extends HAIError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, { statusCode, headers });
    this.name = 'RateLimitError';
    this.retryAfter = this.getRetryAfterFromHeaders();
  }

  private getRetryAfterFromHeaders(): number | undefined {
    if (this.headers && 'retry-after' in this.headers) {
      try {
        return parseInt(this.headers['retry-after'], 10);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  toString(): string {
    let msg = super.toString();
    if (this.retryAfter) {
      msg = `${msg} (Retry after: ${this.retryAfter} seconds)`;
    }
    return msg;
  }
}

/**
 * Raised when too many requests are made within a time window.
 */
export class TooManyRequestsError extends RateLimitError {
  constructor(statusCode?: number, headers?: Record<string, string>) {
    super('Too many requests', statusCode, headers);
    this.name = 'TooManyRequestsError';
  }
}

/**
 * Raised when the API service is unavailable.
 */
export class ServiceUnavailableError extends HAIError {
  constructor(statusCode?: number, headers?: Record<string, string>) {
    super('Service temporarily unavailable', { statusCode, headers });
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Raised when a request times out.
 */
export class TimeoutError extends HAIError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Raised when there are network issues connecting to the API.
 */
export class APIConnectionError extends HAIError {
  public readonly shouldRetry: boolean;

  constructor(
    message: string,
    shouldRetry: boolean = false,
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, { statusCode, headers });
    this.name = 'APIConnectionError';
    this.shouldRetry = shouldRetry;
  }
}

/**
 * Generic API error.
 */
export class APIError extends HAIError {
  public readonly code?: string;
  public readonly type?: string;

  constructor(
    message: string,
    code?: string,
    type?: string,
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, { statusCode, headers });
    this.name = 'APIError';
    this.code = code;
    this.type = type;
  }

  toString(): string {
    let msg = super.toString();
    if (this.code) {
      msg = `${msg} (Code: ${this.code})`;
    }
    if (this.type) {
      msg = `${msg} (Type: ${this.type})`;
    }
    return msg;
  }
}

/**
 * Raised when the API server encounters an error.
 */
export class ServerError extends APIError {
  constructor(
    message: string = 'Internal server error',
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, 'server_error', undefined, statusCode, headers);
    this.name = 'ServerError';
  }
}

/**
 * Raised when content is flagged by moderation filters.
 */
export class ContentFilterError extends InvalidRequestError {
  constructor(
    message: string = 'Content violates content policy',
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, {
      code: 'content_filter',
      statusCode,
      headers
    });
    this.name = 'ContentFilterError';
  }
}

/**
 * Raised when the token limit is exceeded.
 */
export class TokenLimitError extends InvalidRequestError {
  constructor(
    message: string = 'Token limit exceeded',
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, {
      code: 'token_limit_exceeded',
      statusCode,
      headers
    });
    this.name = 'TokenLimitError';
  }
}

/**
 * Raised when the provided content is invalid.
 */
export class InvalidContentError extends InvalidRequestError {
  constructor(
    message: string = 'Invalid content provided',
    statusCode?: number,
    headers?: Record<string, string>
  ) {
    super(message, {
      code: 'invalid_content',
      statusCode,
      headers
    });
    this.name = 'InvalidContentError';
  }
}
