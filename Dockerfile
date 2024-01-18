FROM node:20-alpine AS build

RUN apk add --no-cache python3 make gcc g++

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g typescript && npm ci --omit=dev

COPY src/ src/
COPY tsconfig.json ./

RUN npm run build

FROM node:20-alpine AS run

COPY --from=build /app /app
WORKDIR /app

COPY .git/ .git/

CMD ["npm", "start"]
