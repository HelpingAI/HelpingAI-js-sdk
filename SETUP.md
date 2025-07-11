# HelpingAI JavaScript SDK Setup Guide

## 📁 Project Overview

This JavaScript/TypeScript SDK provides a complete interface to the HelpingAI API, offering the same functionality as the Python SDK but optimized for JavaScript environments.

## 🚀 Quick Setup

### For Node.js Projects

1. **Install the package**:
```bash
npm install helpingai
# or
yarn add helpingai
# or 
pnpm add helpingai
```

2. **Set up your API key**:
```bash
export HAI_API_KEY='your-api-key'
```

3. **Start using the SDK**:
```javascript
import { HAI } from 'helpingai';

const hai = new HAI();

const response = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [{ role: "user", content: "Hello!" }]
});

console.log(response.choices[0].message.content);
```

### For Browser Projects

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

## 🛠️ Development Setup

If you want to contribute or modify the SDK:

1. **Clone the repository**:
```bash
git clone https://github.com/HelpingAI/HelpingAI-js.git
cd HelpingAI-js
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the project**:
```bash
npm run build
```

4. **Run tests**:
```bash
npm test
```

5. **Run examples**:
```bash
export HAI_API_KEY='your-api-key'
npm run examples
```

## 📂 Project Structure

```
JS/
├── src/                     # Source code
│   ├── index.ts            # Main entry point
│   ├── client.ts           # HAI client implementation
│   ├── models.ts           # Models API
│   ├── types.ts            # TypeScript definitions
│   └── errors.ts           # Error classes
├── examples/               # Usage examples
│   ├── basic.ts           # Basic usage
│   ├── streaming.ts       # Streaming examples
│   ├── error-handling.ts  # Error handling
│   ├── models.ts          # Model management
│   └── index.ts           # All examples
├── tests/                 # Test files
├── dist/                  # Compiled JavaScript (after build)
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
├── jest.config.js         # Jest test config
├── .eslintrc.js          # ESLint config
├── README.md             # Documentation
├── CONTRIBUTING.md       # Contribution guide
└── LICENSE               # MIT License
```

## 🔧 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Watch mode compilation
- `npm test` - Run test suite
- `npm test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Auto-fix linting issues

## 🌟 Key Features

### ✅ OpenAI-Compatible API
Drop-in replacement with familiar interface patterns.

### ✅ Full TypeScript Support
Complete type definitions for enhanced developer experience.

### ✅ Cross-Platform
Works in Node.js, browsers, and other JavaScript environments.

### ✅ Streaming Support
Real-time response streaming for chat completions.

### ✅ Comprehensive Error Handling
Detailed error types with retry mechanisms.

### ✅ Advanced Filtering
Hide reasoning blocks with `hideThink` parameter.

### ✅ Model Management
List and retrieve information about available models.

## 📚 Usage Examples

### Basic Chat Completion
```javascript
const response = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is emotional intelligence?" }
  ]
});
```

### Streaming Response
```javascript
const stream = await hai.chat.completions.create({
  model: "Helpingai3-raw",
  messages: [{ role: "user", content: "Tell me a story" }],
  stream: true
});

for await (const chunk of stream) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

### Error Handling
```javascript
try {
  const response = await hai.chat.completions.create({
    model: "Helpingai3-raw",
    messages: [{ role: "user", content: "Hello" }]
  });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter} seconds`);
  } else if (error instanceof InvalidRequestError) {
    console.log(`Invalid request: ${error.message}`);
  }
}
```

### Model Management
```javascript
// List all models
const models = await hai.models.list();
models.forEach(model => console.log(model.id));

// Get specific model
const model = await hai.models.retrieve("Helpingai3-raw");
console.log(model.description);
```

## 🚀 Next Steps

1. **Read the full documentation** in README.md
2. **Check out examples** in the examples/ directory
3. **Run tests** to ensure everything works
4. **Start building** your application with HelpingAI!

## 🆘 Need Help?

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Full API reference in README.md
- **Examples**: Working code examples in examples/
- **Email**: varun@helpingai.co

Happy coding with HelpingAI! 🤖✨
