#!/bin/bash

echo "Waiting for the database to be available..."
until PGPASSWORD="$POSTGRES_PASSWORD" pg_isready --host="$POSTGRES_HOST" --port="$POSTGRES_PORT" --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"; do
  sleep 1
done

echo "Starting the bot..."
npm run apply && npm run start
