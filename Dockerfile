ARG PLATFORM="linux/amd64"

FROM --platform=${PLATFORM} node:20-alpine

WORKDIR /app

RUN apk update && apk add postgresql-client && apk cache clean

COPY package*.json ./
RUN npm install

COPY prisma ./
RUN npx prisma generate

COPY src tsconfig.json ./
RUN npm run build

COPY start.sh ./
RUN chmod +x /app/start.sh

CMD [ "sh", "/app/start.sh" ]
