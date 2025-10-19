# Pipel-React Documentation

Welcome to the Pipel-React documentation! This directory contains comprehensive guides and references for using Pipel-React.

> 💡 **Tip**: For a complete documentation map, see [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

## 📚 Documentation Index

### Getting Started

- **[Getting Started Guide](./GETTING_STARTED.md)** - Quick setup, installation, and first steps
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Project structure, architecture, and design principles

### API Documentation

- **[API Reference](./API_REFERENCE.md)** - Complete API documentation with examples
- **[Quick Reference](./QUICK_REFERENCE.md)** - Cheat sheet for common patterns and use cases

### Interactive Documentation

For the best experience, we recommend using our interactive VitePress documentation:

```bash
# Start the development server
pnpm docs:dev

# Build the documentation
pnpm docs:build

# Preview the built documentation
pnpm docs:preview
```

Visit the documentation at: http://localhost:5173

### Online Documentation

The latest documentation is also available online at:

- **[https://pipeljs.github.io/pipel-react/](https://pipeljs.github.io/pipel-react/)**

## 📖 What's Inside

### Core Concepts

- **Reactive Programming** - Understanding streams and observables
- **Stream Rendering** - How Pipel-React renders components
- **Immutable Updates** - State management best practices

### Core APIs

- **Hooks** - `usePipel`, `useStream`, `useObservable`, etc.
- **HTTP** - `useFetch`, `createFetch`
- **Operators** - Transform, filter, combine, and more
- **Utilities** - Debugging, persistence, and helpers

### Advanced Topics

- **Custom Hooks** - Building your own reactive hooks
- **Performance** - Optimization techniques
- **Testing** - Testing reactive components
- **TypeScript** - Type-safe stream programming

## 🔍 Quick Links

| Topic        | Link                                                 |
| ------------ | ---------------------------------------------------- |
| Installation | [Getting Started](./GETTING_STARTED.md#installation) |
| Basic Usage  | [Quick Reference](./QUICK_REFERENCE.md#basic-usage)  |
| API List     | [API Reference](./API_REFERENCE.md#api-list)         |
| Examples     | [Project Root](../examples)                          |
| Changelog    | [CHANGELOG.md](../CHANGELOG.md)                      |

## 🤝 Contributing

Found an issue or want to improve the documentation? Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 📝 Internal Documentation

The `internal/` directory contains development and implementation documentation for maintainers and contributors:

### Documentation Related

- [Docs Checklist](./internal/DOCS_CHECKLIST.md) - Documentation completeness checklist
- [Docs Completion Summary](./internal/DOCS_COMPLETION_SUMMARY.md) - Documentation work summary
- [Final Docs Report](./internal/FINAL_DOCS_REPORT.md) - Final documentation report

### Code Related

- [API Coverage Analysis](./internal/API_COVERAGE_ANALYSIS.md) - API test coverage analysis
- [Fixes Applied](./internal/FIXES_APPLIED.md) - Code fixes and refactoring records
- [Test Summary](./internal/TEST_SUMMARY.md) - Testing work summary

### Architecture Related

- [Monorepo Architecture](./internal/MONOREPO_ARCHITECTURE.md) - Architecture design
- [GitHub Workflows Setup](./internal/GITHUB_WORKFLOWS_SETUP.md) - CI/CD configuration

For a complete list, see [Documentation Organization](./DOCUMENTATION_ORGANIZATION.md).

## 📄 License

MIT © PipelJS Team
