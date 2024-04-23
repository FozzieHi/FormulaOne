FROM node:20-alpine AS build

RUN apk add --no-cache python3 make g++ && npm install -g typescript

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install --no-save @tsconfig/node20

COPY src/ src/
COPY tsconfig.json ./
RUN npm run build && npm remove --no-save @tsconfig/node20

FROM node:20-alpine AS run

WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY .git/HEAD .git/HEAD
COPY package.json ./

CMD ["node", "dist/index.js"]
