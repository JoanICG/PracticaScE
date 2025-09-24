# Frontend Dockerfile
FROM node:20-bookworm-slim

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/. .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
