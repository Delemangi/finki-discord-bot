# Development stage
FROM --platform=${BUILDPLATFORM} node:20-alpine AS development
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --ignore-scripts && npm cache clean --force

COPY prisma ./prisma
RUN npm run generate

COPY . ./
RUN npm run build

# Production stage
FROM --platform=${TARGETPLATFORM} node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json ./

COPY --from=development /app/node_modules ./node_modules
RUN npm prune --production --no-optional && npm cache clean --force

COPY --from=development /app/prisma ./prisma
COPY --from=development /app/dist ./dist

CMD [ "sh", "-c", "npm run migrate && npm run start" ]
