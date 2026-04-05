# Quickstart: Arike First Release

## Getting Started

### Option 1: Command-Line (Recommended)

1. **Prerequisites**: Node.js 20+ installed.
2. **Install and Run**:
   ```bash
   npm install
   npm run build
   npm start
   ```
3. **Access**: Navigate to `http://localhost:3000`.

### Option 2: Docker

1. **Prerequisites**: Docker installed on your host system.
2. **Build and Run**:
   ```bash
   docker build -t arike-dashboard .
   docker run -p 3000:3000 -v /path/to/data:/app/data arike-dashboard
   ```
3. **Access**: Navigate to `http://localhost:3000`.

## Configuration
- No configuration files needed.
- All settings (themes, bookmarks, collections) managed through the dashboard UI.
- Data persists automatically to `/app/data/bookmarks.db`.
- Uploaded icons saved to `/app/data/icons`.

## Testing
- Run unit/integration tests with:
  ```bash
  npm run test
  ```
- Run E2E tests:
  ```bash
  npm run test:e2e
  ```
