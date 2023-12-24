ARG PLATFORM="linux/amd64"

# Development stage
FROM node:20-alpine AS development
WORKDIR /app

RUN apk add --no-cache postgresql-client openjdk17 nodejs

COPY package.json package-lock.json ./
RUN npm i

COPY prisma ./prisma
RUN npx prisma generate

COPY . ./
RUN npm run build

CMD [ "npm", "run", "dev" ]

# Production stage
FROM --platform=${PLATFORM} node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY --from=development /app/package.json /app/start.sh ./
COPY --from=development /app/node_modules ./node_modules
RUN npm prune --production

COPY --from=development /app/prisma ./prisma
COPY --from=development /app/dist ./dist

CMD [ "sh", "./start.sh" ]
