# HelpingAI JavaScript SDK

The official JavaScript/TypeScript library for the [HelpingAI](https://helpingai.co) API - Advanced AI with Emotional Intelligence

[![npm version](https://badge.fury.io/js/helpingai.svg)](https://badge.fury.io/js/helpingai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **OpenAI-Compatible API**: Drop-in replacement with familiar interface
- **Emotional Intelligence**: Advanced AI models with emotional understanding
- **Streaming Support**: Real-time response streaming
- **Comprehensive Error Handling**: Detailed error types and retry mechanisms
- **TypeScript Support**: Full type definitions included
- **Cross-Platform**: Works in Node.js and browsers
- **Flexible Configuration**: Environment variables and direct initialization

## 📦 Installation

```bash
npm install helpingai
# or
yarn add helpingai
# or
pnpm add helpingai
```

## 🔑 Authentication

Get your API key from the [HelpingAI Dashboard](https://helpingai.co/dashboard).

### Environment Variable (Recommended)

```bash
export HAI_API_KEY='your-api-key'
```

### Direct Initialization

```javascript
import { HAI } from 'helpingai';

const hai = new HAI({ apiKey: 'your-api-key' });
```

## 🎯 Quick Start

### ES6/TypeScript

```typescript
import { HAI } from 'helpingai';

// Initialize client
const hai = new HAI();

// Create a chat completion
const response = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [
    { role: "system", content: "You are an expert in emotional intelligence." },
    { role: "user", content: "What makes a good leader?" }
  ]
});

console.log(response.choices[0].message.content);
```

### CommonJS/Node.js

```javascript
const { HAI } = require('helpingai');

// Initialize client
const hai = new HAI();

async function example() {
  // Create a chat completion
  const response = await hai.chat.completions.create({
    model: "Helpingai3-raw",
    messages: [
      { role: "user", content: "Tell me about empathy" }
    ]
  });

  console.log(response.choices[0].message.content);
}

example();
```

## 🌊 Streaming Responses

```typescript
// Stream responses in real-time
const stream = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [{ role: "user", content: "Tell me about empathy" }],
  stream: true
});

for await (const chunk of stream) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

## ⚙️ Advanced Configuration

### Parameter Control

```typescript
const response = await hai.chat.completions.create({
  model: "Dhanishtha-2.0-preview",
  messages: [{ role: "user", content: "Write a story about empathy" }],
  temperature: 0.7,        // Controls randomness (0-1)
  max_tokens: 500,        // Maximum length of response
  top_p: 0.9,            // Nucleus sampling parameter
  frequency_penalty: 0.3, // Reduces repetition
  presence_penalty: 0.3,  // Encourages new topics
  hideThink: true        // Filter out reasoning blocks
});
```

### Client Configuration

```typescript
const hai = new HAI({
  apiKey: "your-api-key",
  baseURL: "https://api.helpingai.co/v1",  // Custom base URL
  timeout: 30000,                          // Request timeout (ms)
  organization: "your-org-id"              // Organization ID
});
```

## 🛡️ Error Handling

```typescript
import { 
  HAI, 
  HAIError, 
  RateLimitError, 
  InvalidRequestError,
  AuthenticationError 
} from 'helpingai';

async function makeCompletionWithRetry(messages: any[], maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await hai.chat.completions.create({
        model: "Helpingai3-raw",
        messages
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        if (attempt === maxRetries - 1) throw error;
        await new Promise(resolve => 
          setTimeout(resolve, (error.retryAfter || 1) * 1000)
        );
      } else if (error instanceof InvalidRequestError) {
        console.error(`Invalid request: ${error.message}`);
        throw error;
      } else if (error instanceof AuthenticationError) {
        console.error(`Authentication failed: ${error.message}`);
        throw error;
      } else if (error instanceof HAIError) {
        console.error(`API error: ${error.message}`);
        throw error;
      } else {
        throw error;
      }
    }
  }
}
```

## 🤖 Available Models

### Helpingai3-raw
- **Advanced Emotional Intelligence**: Enhanced emotional understanding and contextual awareness
- **Training Data**: 15M emotional dialogues, 3M therapeutic exchanges, 250K cultural conversations, 1M crisis response scenarios
- **Best For**: AI companionship, emotional support, therapy guidance, personalized learning

### Dhanishtha-2.0-preview
- **World's First Intermediate Thinking Model**: Multi-phase reasoning with self-correction capabilities
- **Unique Features**: `<think>...</think>` blocks for transparent reasoning, structured emotional reasoning (SER)
- **Best For**: Complex problem-solving, analytical tasks, educational content, reasoning-heavy applications

```typescript
// List all available models
const models = await hai.models.list();
models.forEach(model => {
  console.log(`Model: ${model.id} - ${model.description}`);
});

// Get specific model info
const model = await hai.models.retrieve("Helpingai3-raw");
console.log(`Model: ${model.name}`);

// Use Dhanishtha-2.0 for complex reasoning
const response = await hai.chat.completions.create({
  model: "Dhanishtha-2.0-preview",
  messages: [{ role: "user", content: "Solve this step by step: What's 15% of 240?" }],
  hideThink: false  // Show reasoning process
});
```

## 🌐 Browser Usage

For browser environments, you can use a CDN:

```html
<script type="module">
  import { HAI } from 'https://cdn.skypack.dev/helpingai';
  
  const hai = new HAI({ apiKey: 'your-api-key' });
  
  const response = await hai.chat.completions.create({
    model: "Helpingai3-raw",
    messages: [{ role: "user", content: "Hello!" }]
  });
  
  console.log(response.choices[0].message.content);
</script>
```

## 🏗️ Project Structure

```
helpingai-js/
├── src/
│   ├── index.ts          # Main entry point
│   ├── client.ts         # HAI client and API classes
│   ├── models.ts         # Model management
│   ├── types.ts          # TypeScript type definitions
│   └── errors.ts         # Error classes
├── dist/                 # Compiled JavaScript
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔧 Requirements

- **Node.js**: 14+ (for Node.js environments)
- **Modern Browsers**: Chrome 63+, Firefox 57+, Safari 10.1+, Edge 79+
- **Dependencies**: 
  - `node-fetch` (for Node.js environments without native fetch)

## 📚 TypeScript Support

This library is written in TypeScript and includes full type definitions:

```typescript
import { 
  HAI, 
  ChatCompletion, 
  ChatCompletionChunk,
  Model,
  HAIClientOptions 
} from 'helpingai';

// Full type safety
const options: HAIClientOptions = {
  apiKey: "your-api-key",
  timeout: 30000
};

const hai = new HAI(options);

const response: ChatCompletion = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [{ role: "user", content: "Hello!" }]
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **Issues**: [GitHub Issues](https://github.com/HelpingAI/HelpingAI-js/issues)
- **Documentation**: [HelpingAI Docs](https://helpingai.co/docs)
- **Dashboard**: [HelpingAI Dashboard](https://helpingai.co/dashboard)
- **Email**: varun@helpingai.co

## 🚀 What's New in v1.1.0

- **Cross-Platform Support**: Works in Node.js and browsers
- **Updated Models**: Support for latest models (Helpingai3-raw, Dhanishtha-2.0-preview)
- **Dhanishtha-2.0 Integration**: World's first intermediate thinking model with multi-phase reasoning
- **HelpingAI3 Support**: Enhanced emotional intelligence with advanced contextual awareness
- **OpenAI-Compatible Interface**: Familiar API design
- **Enhanced Error Handling**: Comprehensive exception types
- **Streaming Support**: Real-time response streaming
- **Advanced Filtering**: Hide reasoning blocks with `hideThink` parameter
- **Full TypeScript Support**: Complete type definitions

---

**Built with ❤️ by the HelpingAI Team**

*Empowering AI with Emotional Intelligence*
