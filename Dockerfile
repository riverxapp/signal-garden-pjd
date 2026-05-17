FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git ca-certificates
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prefer-offline --no-frozen-lockfile

COPY . .

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["node", "scripts/dev-supervisor.js"]
