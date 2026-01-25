FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app

# Copy only dependency files first (better caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install dependencies (cached unless lock files change)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Build only what you need
RUN pnpm --filter=backend --filter=shared build

# Deploy standalone backend
RUN pnpm deploy --filter=backend --prod /prod/backend --legacy

FROM base AS backend
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /prod/backend/node_modules ./node_modules
COPY --from=build /prod/backend/package.json ./package.json
COPY --from=build /usr/src/app/packages/backend/.build ./.build

USER node

EXPOSE 3000

CMD ["node", ".build/main.js"]