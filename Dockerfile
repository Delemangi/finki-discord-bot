ARG PLATFORM="linux/amd64"

# Build stage
FROM --platform=${PLATFORM} node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY prisma ./prisma
RUN npx prisma generate

COPY src tsconfig.json ./
RUN npm run build

COPY start.sh ./

RUN npm prune --production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

RUN apk update && apk add postgresql-client && apk cache clean

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/start.sh ./

CMD [ "sh", "/app/start.sh" ]
