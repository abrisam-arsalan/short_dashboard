# TimeLoom — Dockerfile (target: Linux Intel Xeon server)
# Multi-stage build: deps → build → production

# === Stage 1: Dependencies ===
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# === Stage 2: Build ===
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client
RUN npx prisma generate
# Build Next.js
RUN npm run build

# === Stage 3: Production ===
FROM node:22-slim AS production
WORKDIR /app

# Install ffmpeg (untuk komposisi overlay)
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy built app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/fonts ./fonts
COPY --from=build /app/scripts ./scripts

# Storage directories
RUN mkdir -p storage/raw storage/composed storage/assets storage/tmp \
    storage/inbox/sawdustsprint storage/inbox/bloomblitz storage/inbox/wildlapse \
    storage/inbox/_ditolak

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
