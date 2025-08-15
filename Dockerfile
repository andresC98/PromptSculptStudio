FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 5173

CMD ["pnpm", "preview"]
