# News Summary Agent Frontend

React TypeScript frontend for the News Summary Agent.

## Cross-Platform Setup

### Initial Setup
```bash
# Install dependencies for your current platform
npm install

# Verify everything works
npm run type-check
npm run dev
```

### Switching Between Platforms (Mac ↔ Linux)
If you encounter esbuild platform errors when switching between Mac and Linux:

```bash
# Quick fix: Fresh install for current platform
npm run fresh-install

# Or manually:
npm run clean
npm install
```

### Common Platform Issues

**Error: "You installed esbuild for another platform"**
- **Cause**: Moving node_modules between Mac and Linux
- **Solution**: Run `npm run fresh-install`

**Error: Node version mismatch**
- **Cause**: Different Node.js versions between environments
- **Solution**: Use Node.js v18.19.1 (see `.nvmrc`)
- **With nvm**: `nvm use` or `nvm install`

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
npm run test         # Run tests
```

## Scripts

- `clean` - Remove node_modules, package-lock.json, and dist
- `fresh-install` - Clean and reinstall dependencies
- `setup` - Full setup (fresh install + type check)

## Environment

- **Node.js**: v18.19.1 (see `.nvmrc`)
- **Package Manager**: npm
- **Dev Server**: http://localhost:3000
- **API Proxy**: /api → http://localhost:8000