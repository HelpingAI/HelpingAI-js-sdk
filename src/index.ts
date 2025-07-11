/**
 * HelpingAI JavaScript/TypeScript SDK
 * 
 * The official JavaScript library for the HelpingAI API - Advanced AI with Emotional Intelligence
 */

// Export main client
export { HAI } from './client';

// Export error classes
export {
  HAIError,
  AuthenticationError,
  NoAPIKeyError,
  InvalidAPIKeyError,
  PermissionDeniedError,
  InvalidRequestError,
  InvalidModelError,
  RateLimitError,
  TooManyRequestsError,
  ServiceUnavailableError,
  TimeoutError,
  APIConnectionError,
  APIError,
  ServerError,
  ContentFilterError,
  TokenLimitError,
  InvalidContentError
} from './errors';

// Export types
export type {
  BaseModel,
  FunctionCall,
  ToolFunction,
  ToolCall,
  CompletionUsage,
  ChoiceDelta,
  ChatCompletionMessage,
  Choice,
  ChatCompletion,
  ChatCompletionChunk,
  Model,
  ChatCompletionRequest,
  HAIClientOptions,
  StreamingState,
  ErrorResponse
} from './types';

// Export models
export { Models } from './models';

// Export chat classes
export { Chat, ChatCompletions } from './client';

// Re-export HAI as default
import { HAI } from './client';
export default HAI;
