# Base build
FROM node:10.16.0-alpine as base

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production \
    && npm cache clean --force

# Development build
FROM base as dev

ENV NODE_ENV=development

RUN npm install --only=development

CMD [ "npm", "run", "start:dev" ]

# Transpile TypeScript to JavaScript
FROM dev as build

COPY . .

RUN tsc

# Production build
FROM base as prod

COPY --from=build /app/dist/ .

CMD [ "node", "app.js" ]
