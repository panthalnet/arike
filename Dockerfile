FROM node:20-alpine AS base
# su-exec is used in the entrypoint to drop from root to the nextjs user
RUN apk add --no-cache su-exec

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Build tools required by better-sqlite3 (native addon) when the pre-built
# binary download fails — python3 + make + g++ are needed by node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

LABEL org.opencontainers.image.logo="https://raw.githubusercontent.com/panthalnet/arike/main/public/icon-512.png"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory; subdirectory ownership is handled at runtime by
# entrypoint.sh so bind-mounted volumes work without clobbering host ownership
RUN mkdir -p /app/data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Entrypoint fixes /app/data ownership for mounted volumes then drops to nextjs
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Run as root so the entrypoint can chown the data directory before dropping privileges
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
