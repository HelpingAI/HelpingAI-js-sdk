// Simplified fetch implementation detection
declare const globalThis: any;
declare const window: any;
declare const process: any;
declare function require(module: string): any;
declare function setTimeout(callback: () => void, ms: number): any;
declare function clearTimeout(id: any): void;
declare class AbortController {
  signal: AbortSignal;
  abort(): void;
}
declare class AbortSignal {
  addEventListener(type: string, listener: () => void): void;
}
declare class TextDecoder {
  decode(input?: Uint8Array, options?: { stream?: boolean }): string;
}

// Import fetch for Node.js environments
let fetchImpl: any;
try {
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    fetchImpl = globalThis.fetch;
  } else if (typeof window !== 'undefined' && window.fetch) {
    fetchImpl = window.fetch;
  } else {
    fetchImpl = require('node-fetch');
  }
} catch {
  fetchImpl = null;
}
import {
  HAIError,
  InvalidRequestError,
  InvalidModelError,
  NoAPIKeyError,
  InvalidAPIKeyError,
  AuthenticationError,
  APIError,
  RateLimitError,
  TooManyRequestsError,
  ServiceUnavailableError,
  TimeoutError,
  APIConnectionError,
  ServerError,
  ContentFilterError
} from './errors';
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionRequest,
  Choice,
  ChoiceDelta,
  ChatCompletionMessage,
  ToolCall,
  ToolFunction,
  FunctionCall,
  CompletionUsage,
  HAIClientOptions,
  StreamingState,
  ErrorResponse
} from './types';
import { Models } from './models';

/**
 * Base client with common functionality for the HelpingAI API.
 * Handles authentication, session management, and low-level HTTP requests.
 */
export class BaseClient {
  protected apiKey: string;
  protected organization?: string;
  protected baseURL: string;
  protected timeout: number;
  protected fetchImpl: any;

  constructor(options: HAIClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.HAI_API_KEY || '';
    if (!this.apiKey) {
      throw new NoAPIKeyError();
    }
    this.organization = options.organization;
    this.baseURL = (options.baseURL || 'https://api.helpingai.co/v1').replace(/\/$/, '');
    this.timeout = options.timeout || 60000;
    this.fetchImpl = options.fetch || fetchImpl;
    
    if (!this.fetchImpl) {
      throw new Error('No fetch implementation available. Please install node-fetch or use a modern browser.');
    }
  }

  /**
   * Make a request to the HAI API.
   */
  async request(
    method: string,
    path: string,
    data?: any,
    options: {
      stream?: boolean;
      authRequired?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<any> {
    const { stream = false, authRequired = true, signal } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (authRequired) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (this.organization) {
      headers['HAI-Organization'] = this.organization;
    }

    const url = `${this.baseURL}${path}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      const response = await this.fetchImpl(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (stream) {
        return response;
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timed out');
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new APIConnectionError(`Error connecting to HAI API: ${error.message}`, true);
      }
      if (error instanceof HAIError) {
        throw error;
      }
      throw new APIError(`Error communicating with HAI API: ${error.message}`);
    }
  }

  private async handleErrorResponse(response: any): Promise<never> {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: 'Unknown error occurred' } };
    }

    let errorMessage: string;
    let errorType: string | undefined;
    let errorCode: string | undefined;

    if (typeof errorData.error === 'object' && errorData.error !== null) {
      // Nested format: {"error": {"message": "...", "type": "...", "code": "..."}}
      errorMessage = errorData.error.message || 'Unknown error';
      errorType = errorData.error.type;
      errorCode = errorData.error.code;
    } else if (typeof errorData.error === 'string') {
      // Flat format: {"error": "Request failed with status code 400"}
      errorMessage = errorData.error;
      errorType = undefined;
      errorCode = undefined;
    } else {
      // Fallback for other formats
      errorMessage = errorData.message || 'Unknown error';
      errorType = errorData.type;
      errorCode = errorData.code;
    }

    const status = response.status;
    const headers = this.extractHeaders(response);

    if (status === 401) {
      throw new InvalidAPIKeyError(status, headers);
    } else if (status === 400) {
      // Handle model errors
      if (errorMessage.toLowerCase().includes('model')) {
        const match = errorMessage.match(/'([^']*)'/);
        const modelName = match ? match[1] : 'Unknown model';
        throw new InvalidModelError(modelName, status, headers);
      }
      throw new InvalidRequestError(errorMessage, { statusCode: status, headers });
    } else if (status === 429) {
      throw new TooManyRequestsError(status, headers);
    } else if (status === 503) {
      throw new ServiceUnavailableError(status, headers);
    } else if (status >= 500) {
      throw new ServerError(errorMessage, status, headers);
    } else if (errorType && errorType.toLowerCase().includes('content_filter')) {
      throw new ContentFilterError(errorMessage, status, headers);
    } else {
      throw new APIError(errorMessage, errorCode, errorType, status, headers);
    }
  }

  private extractHeaders(response: any): Record<string, string> {
    const headers: Record<string, string> = {};
    if (response.headers) {
      response.headers.forEach((value: string, key: string) => {
        headers[key.toLowerCase()] = value;
      });
    }
    return headers;
  }
}

/**
 * Chat completions API interface for the HelpingAI client.
 */
export class ChatCompletions {
  private client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a chat completion.
   */
  async create(request: ChatCompletionRequest & { hideThink?: boolean }): Promise<ChatCompletion | AsyncIterable<ChatCompletionChunk>> {
    const {
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      stop,
      stream = false,
      user,
      n,
      logprobs,
      top_logprobs,
      response_format,
      seed,
      tools,
      tool_choice = 'auto',
      hideThink = false
    } = request;

    const requestData: any = {
      model,
      messages,
      stream
    };

    // Add optional parameters
    if (temperature !== undefined) requestData.temperature = temperature;
    if (max_tokens !== undefined) requestData.max_tokens = max_tokens;
    if (top_p !== undefined) requestData.top_p = top_p;
    if (frequency_penalty !== undefined) requestData.frequency_penalty = frequency_penalty;
    if (presence_penalty !== undefined) requestData.presence_penalty = presence_penalty;
    if (stop !== undefined) requestData.stop = stop;
    if (user !== undefined) requestData.user = user;
    if (n !== undefined) requestData.n = n;
    if (logprobs !== undefined) requestData.logprobs = logprobs;
    if (top_logprobs !== undefined) requestData.top_logprobs = top_logprobs;
    if (response_format !== undefined) requestData.response_format = response_format;
    if (seed !== undefined) requestData.seed = seed;
    if (tools !== undefined) requestData.tools = tools;
    if (tools && tool_choice !== undefined) requestData.tool_choice = tool_choice;

    const response = await this.client.request(
      'POST',
      '/chat/completions',
      requestData,
      { stream }
    );

    if (stream) {
      const streamIterable = this.handleStreamResponse(response);
      if (hideThink) {
        return this.createFilteredStreamGenerator(streamIterable);
      }
      return streamIterable;
    }

    const completion = this.handleResponse(response);
    if (hideThink) {
      return this.filterCompletion(completion);
    }
    return completion;
  }

  private handleResponse(data: any): ChatCompletion {
    const choices: Choice[] = [];
    
    for (const choiceData of data.choices || []) {
      const messageData = choiceData.message || {};
      
      let toolCalls: ToolCall[] | undefined;
      if (messageData.tool_calls) {
        toolCalls = messageData.tool_calls.map((tc: any) => ({
          id: tc.id || '',
          type: tc.type || 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }));
      }

      let functionCall: FunctionCall | undefined;
      if (messageData.function_call) {
        functionCall = {
          name: messageData.function_call.name,
          arguments: messageData.function_call.arguments
        };
      }

      const message: ChatCompletionMessage = {
        role: messageData.role || '',
        content: messageData.content,
        function_call: functionCall,
        tool_calls: toolCalls
      };

      const choice: Choice = {
        index: choiceData.index || 0,
        message,
        finish_reason: choiceData.finish_reason,
        logprobs: choiceData.logprobs
      };

      choices.push(choice);
    }

    let usage: CompletionUsage | undefined;
    if (data.usage) {
      usage = {
        completion_tokens: data.usage.completion_tokens || 0,
        prompt_tokens: data.usage.prompt_tokens || 0,
        total_tokens: data.usage.total_tokens || 0
      };
    }

    return {
      id: data.id || '',
      created: data.created || 0,
      model: data.model || '',
      choices,
      object: 'chat.completion',
      system_fingerprint: data.system_fingerprint,
      usage
    };
  }

  private async* handleStreamResponse(response: any): AsyncIterable<ChatCompletionChunk> {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') return;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const choices: Choice[] = [];

              for (const choiceData of data.choices || []) {
                const deltaData = choiceData.delta || {};

                let toolCalls: ToolCall[] | undefined;
                if (deltaData.tool_calls) {
                  toolCalls = deltaData.tool_calls.map((tc: any) => ({
                    id: tc.id || '',
                    type: tc.type || 'function',
                    function: {
                      name: tc.function.name,
                      arguments: tc.function.arguments
                    }
                  }));
                }

                let functionCall: FunctionCall | undefined;
                if (deltaData.function_call) {
                  functionCall = {
                    name: deltaData.function_call.name,
                    arguments: deltaData.function_call.arguments
                  };
                }

                const delta: ChoiceDelta = {
                  content: deltaData.content,
                  function_call: functionCall,
                  role: deltaData.role,
                  tool_calls: toolCalls
                };

                const choice: Choice = {
                  index: choiceData.index || 0,
                  delta,
                  finish_reason: choiceData.finish_reason,
                  logprobs: choiceData.logprobs
                };

                choices.push(choice);
              }

              yield {
                id: data.id || '',
                created: data.created || 0,
                model: data.model || '',
                choices,
                object: 'chat.completion.chunk',
                system_fingerprint: data.system_fingerprint
              };
            } catch (error) {
              throw new HAIError(`Error parsing stream: ${error}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private filterCompletion(completion: ChatCompletion): ChatCompletion {
    const filteredChoices = completion.choices.map(choice => {
      if (choice.message && choice.message.content) {
        const filteredContent = this.filterThinkSerBlocks(choice.message.content);
        return {
          ...choice,
          message: {
            ...choice.message,
            content: filteredContent
          }
        };
      }
      return choice;
    });

    return {
      ...completion,
      choices: filteredChoices
    };
  }

  private async* createFilteredStreamGenerator(
    streamIterable: AsyncIterable<ChatCompletionChunk>
  ): AsyncIterable<ChatCompletionChunk> {
    const state: StreamingState = {
      isReasoning: false,
      isSer: false
    };
    let buffer = '';
    let consecutiveNewlines = 0;
    let lastCharWasSpace = false;
    let streamStarted = false;

    for await (const chunk of streamIterable) {
      const newChoices: Choice[] = [];
      let shouldYieldChunk = false;

      for (const choice of chunk.choices) {
        if (choice.delta && choice.delta.content) {
          buffer += choice.delta.content;
          let outputContent = '';
          let processedLen = 0;

          while (processedLen < buffer.length) {
            const remaining = buffer.slice(processedLen);

            if (state.isReasoning) {
              if (remaining.startsWith('</think>')) {
                state.isReasoning = false;
                processedLen += 8;
                lastCharWasSpace = true;
                continue;
              }
              if ('</think>'.startsWith(remaining)) {
                break;
              }
              processedLen += 1;
              continue;
            }

            if (state.isSer) {
              if (remaining.startsWith('</ser>')) {
                state.isSer = false;
                processedLen += 6;
                lastCharWasSpace = true;
                continue;
              }
              if ('</ser>'.startsWith(remaining)) {
                break;
              }
              processedLen += 1;
              continue;
            }

            if (remaining.startsWith('<think>')) {
              state.isReasoning = true;
              processedLen += 7;
              continue;
            }

            if (remaining.startsWith('<ser>')) {
              state.isSer = true;
              processedLen += 5;
              continue;
            }

            if ('<think>'.startsWith(remaining) || '<ser>'.startsWith(remaining)) {
              break;
            }

            const char = buffer[processedLen];

            if (!streamStarted && /\s/.test(char)) {
              processedLen += 1;
              continue;
            }
            streamStarted = true;

            if (char === '\n') {
              consecutiveNewlines += 1;
              if (consecutiveNewlines <= 2) {
                outputContent += char;
              }
              lastCharWasSpace = false;
            } else if (/\s/.test(char)) {
              if (!lastCharWasSpace) {
                outputContent += ' ';
              }
              lastCharWasSpace = true;
            } else {
              consecutiveNewlines = 0;
              lastCharWasSpace = false;
              outputContent += char;
            }

            processedLen += 1;
          }

          buffer = buffer.slice(processedLen);

          if (outputContent) {
            shouldYieldChunk = true;
            newChoices.push({
              index: choice.index,
              delta: {
                content: outputContent,
                role: choice.delta.role,
                function_call: choice.delta.function_call,
                tool_calls: choice.delta.tool_calls
              },
              finish_reason: choice.finish_reason,
              logprobs: choice.logprobs
            });
          } else if (choice.finish_reason) {
            shouldYieldChunk = true;
            newChoices.push({
              index: choice.index,
              delta: {
                content: undefined,
                role: choice.delta.role,
                function_call: choice.delta.function_call,
                tool_calls: choice.delta.tool_calls
              },
              finish_reason: choice.finish_reason,
              logprobs: choice.logprobs
            });
          }
        } else {
          shouldYieldChunk = true;
          newChoices.push(choice);
        }
      }

      if (shouldYieldChunk) {
        yield {
          ...chunk,
          choices: newChoices
        };
      }
    }
  }

  private filterThinkSerBlocks(text?: string): string | undefined {
    if (!text) return text;

    // Remove think and ser blocks
    let result = text.replace(/<think>[\s\S]*?<\/think>/g, '');
    result = result.replace(/<ser>[\s\S]*?<\/ser>/g, '');

    // Fix broken words that may have been split across lines
    result = result.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

    // Remove excessive empty lines (more than 2 consecutive newlines become 2)
    result = result.replace(/\n{3,}/g, '\n\n');

    // Remove extra spaces that might be left behind
    result = result.replace(/ {2,}/g, ' ');
    result = result.trim();

    return result;
  }
}

/**
 * Chat API interface for the HelpingAI client.
 */
export class Chat {
  public completions: ChatCompletions;

  constructor(client: BaseClient) {
    this.completions = new ChatCompletions(client);
  }
}

/**
 * HAI API client for the HelpingAI platform.
 * This is the main entry point for interacting with the HelpingAI API.
 */
export class HAI extends BaseClient {
  public chat: Chat;
  public models: Models;

  constructor(options: HAIClientOptions = {}) {
    super(options);
    this.chat = new Chat(this);
    this.models = new Models(this);
  }
}
