# Development stage
FROM --platform=${BUILDPLATFORM} node:20-alpine AS development
WORKDIR /app

RUN apk add --no-cache postgresql-client git openjdk17 nodejs

COPY package.json package-lock.json ./
RUN npm i --ignore-scripts

COPY prisma ./prisma
RUN npm run generate

COPY . ./
RUN npm run build

CMD [ "npm", "run", "dev" ]

# Production stage
FROM --platform=${TARGETPLATFORM} node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY --from=development /app/package.json /app/start.sh ./
COPY --from=development /app/node_modules ./node_modules
RUN npm i @prisma/client && npm prune --production

COPY --from=development /app/prisma ./prisma
COPY --from=development /app/dist ./dist

CMD [ "sh", "./start.sh" ]
