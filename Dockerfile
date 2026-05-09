# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Note: In a real environment, you might run drizzle-kit push here or inside the container entrypoint
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Create an empty sqlite DB file for persistence setup 
RUN touch sqlite.db
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
