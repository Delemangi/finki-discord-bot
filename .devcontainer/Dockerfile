FROM mcr.microsoft.com/devcontainers/typescript-node:22
WORKDIR /app

USER root
RUN mkdir -p /app/node_modules /app/.husky && chown -R node:node /app/node_modules /app/.husky
USER node

CMD [ "sleep", "infinity" ]
