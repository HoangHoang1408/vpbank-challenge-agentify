FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p public && \
    if [ ! "$(ls -A public)" ]; then \
    touch public/.gitkeep; \
    fi

RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app

ARG NODE_ENV=production
ARG PORT=3000
ARG NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

RUN apk add --no-cache libc6-compat

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p ./public
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000
CMD ["node", "server.js"]
