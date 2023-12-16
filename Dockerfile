ARG PLATFORM="linux/amd64"

# Build stage
FROM node:20 AS development
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY prisma ./prisma
RUN npx prisma generate

COPY src tsconfig.json ./
RUN npm run build

COPY start.sh ./

RUN apt-get update && apt-get install postgresql-client gnupg2 -y && apt-get clean

COPY nodemon.json ./

CMD [ "npm", "run", "dev" ]

# Production stage
FROM --platform=${PLATFORM} node:20-alpine AS production
WORKDIR /app

COPY --from=development /app/dist ./dist
COPY --from=development /app/prisma ./prisma
COPY --from=development /app/package.json ./
COPY --from=development /app/start.sh ./

RUN npm i --production

RUN apk update && apk add postgresql-client && apk cache clean

CMD [ "npm", "run", "start" ]
