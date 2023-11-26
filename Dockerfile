FROM node:18-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g typescript && npm ci --omit=dev

COPY src/ src/
COPY tsconfig.json ./

RUN npm run build

COPY .git/ .git/

CMD ["npm", "start"]
