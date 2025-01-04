FROM --platform=${BUILDPLATFORM} node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --ignore-scripts

COPY prisma ./prisma
RUN npm run generate

COPY . ./
RUN npm run build

FROM node:22-alpine AS final
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm i --production --ignore-scripts

COPY --from=build /app/prisma ./prisma
RUN npm run generate && npm cache clean --force

COPY --from=build /app/dist ./dist

CMD [ "sh", "-c", "npm run apply && npm run start" ]
