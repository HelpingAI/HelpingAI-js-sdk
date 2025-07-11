/**
 * Type definitions for HelpingAI API responses and requests.
 */

export interface BaseModel {
  toDict(): Record<string, any>;
}

export enum ToolCallType {
  FUNCTION = 'function'
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolFunction {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: string;
  function: ToolFunction;
}

export interface CompletionUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: Record<string, any>;
}

export interface ChoiceDelta {
  content?: string;
  function_call?: FunctionCall;
  role?: string;
  tool_calls?: ToolCall[];
}

export interface ChatCompletionMessage {
  role: string;
  content?: string;
  function_call?: FunctionCall;
  tool_calls?: ToolCall[];
}

export interface Choice {
  index: number;
  message?: ChatCompletionMessage;
  delta?: ChoiceDelta;
  finish_reason?: string;
  logprobs?: Record<string, any>;
}

export interface ChatCompletion {
  id: string;
  created: number;
  model: string;
  choices: Choice[];
  object: string;
  system_fingerprint?: string;
  usage?: CompletionUsage;
}

export interface ChatCompletionChunk {
  id: string;
  created: number;
  model: string;
  choices: Choice[];
  object: string;
  system_fingerprint?: string;
}

export interface Model {
  id: string;
  name: string;
  version?: string;
  description?: string;
  object: string;
}

// Request types
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  user?: string;
  n?: number;
  logprobs?: boolean;
  top_logprobs?: number;
  response_format?: Record<string, string>;
  seed?: number;
  tools?: Array<Record<string, any>>;
  tool_choice?: string | Record<string, any>;
}

// Configuration types
export interface HAIClientOptions {
  apiKey?: string;
  organization?: string;
  baseURL?: string;
  timeout?: number;
  fetch?: any; // Custom fetch implementation if needed
}

// Stream types
export interface StreamingState {
  isReasoning: boolean;
  isSer: boolean;
}

// Error response types
export interface ErrorResponse {
  error: {
    message: string;
    type?: string;
    code?: string;
  } | string;
  message?: string;
  type?: string;
  code?: string;
}
