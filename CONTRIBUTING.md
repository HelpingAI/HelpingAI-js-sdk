# Contributing to HelpingAI JavaScript SDK

We welcome contributions to the HelpingAI JavaScript SDK! This document outlines the process for contributing and our development guidelines.

## 🚀 Getting Started

### Prerequisites

- Node.js 14 or higher
- npm, yarn, or pnpm
- Git

### Setting Up the Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/HelpingAI-js.git
cd HelpingAI-js
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

### Project Structure

```
src/
├── index.ts          # Main entry point
├── client.ts         # HAI client implementation
├── models.ts         # Models API
├── types.ts          # TypeScript type definitions
└── errors.ts         # Error classes

examples/             # Usage examples
tests/               # Test files
dist/                # Compiled output (generated)
```

## 🛠️ Development Guidelines

### Code Style

We use ESLint and TypeScript for code quality:

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### TypeScript

- Use strict TypeScript configuration
- All public APIs must have proper type definitions
- Prefer interfaces over types for object shapes
- Use generics appropriately for reusable code

### Testing

We use Jest for testing:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

#### Test Guidelines

- Write tests for all new features
- Maintain high test coverage (aim for >90%)
- Use descriptive test names
- Group related tests in `describe` blocks
- Mock external dependencies

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(client): add streaming support for chat completions
fix(errors): handle undefined error responses gracefully
docs(readme): update installation instructions
```

## 📝 Pull Request Process

1. **Create a feature branch** from `main`:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following the guidelines above

3. **Add or update tests** for your changes

4. **Update documentation** if needed

5. **Run the full test suite**:
```bash
npm run lint
npm test
npm run build
```

6. **Commit your changes** with conventional commit messages

7. **Push your branch** and create a pull request

8. **Fill out the pull request template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Breaking changes (if any)

### Pull Request Guidelines

- Keep PRs focused and atomic
- Include tests for new functionality
- Update documentation for API changes
- Ensure CI passes before requesting review
- Respond to review feedback promptly

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment information**:
   - Node.js version
   - SDK version
   - Operating system

2. **Reproduction steps**:
   - Minimal code example
   - Expected vs actual behavior
   - Error messages/stack traces

3. **Additional context**:
   - Related issues
   - Possible solutions

Use our bug report template when creating issues.

## 💡 Feature Requests

For feature requests, please:

1. Check if the feature already exists or is planned
2. Describe the use case and motivation
3. Provide examples of how it would be used
4. Consider backward compatibility

## 📖 Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add more examples
- Improve API documentation
- Update README or guides

## 🔄 Release Process

Releases are handled by maintainers:

1. Version bump following semantic versioning
2. Update CHANGELOG.md
3. Create GitHub release with release notes
4. Publish to npm

## 🤝 Code of Conduct

Please note that this project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: varun@helpingai.co for security issues

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributor graph
- Release notes for significant contributions

Thank you for contributing to HelpingAI! 🎉
