# Stage 1 – build
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/

RUN npm ci

COPY shared/ shared/
COPY server/ server/
COPY client/ client/
COPY tsconfig.json ./

RUN npm run build -w shared
RUN npm run build -w client
RUN npm run build -w server

# Patch shared to point at compiled JS for production
RUN sed -i 's|"./src/index.ts"|"./dist/index.js"|g' shared/package.json

# Stage 2 – runtime
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/
# Use the patched shared/package.json (main → dist)
COPY --from=build /app/shared/package.json shared/

RUN npm ci --omit=dev -w server

COPY --from=build /app/client/dist client/dist
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/shared/dist shared/dist
# pokemon.json is imported directly by server
COPY shared/src/pokemon.json shared/src/pokemon.json

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
