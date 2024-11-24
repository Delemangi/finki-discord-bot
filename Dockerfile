FROM --platform=${BUILDPLATFORM} node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --ignore-scripts && npm cache clean --force

COPY prisma ./prisma
RUN npm run generate

COPY . ./
RUN npm run build

FROM node:20-alpine AS final
WORKDIR /app

COPY package.json package-lock.json ./

COPY --from=build /app/node_modules ./node_modules
RUN npm prune --production --no-optional && npm cache clean --force

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

CMD [ "sh", "-c", "npm run apply && npm run start" ]
