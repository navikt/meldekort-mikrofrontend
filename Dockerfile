FROM node:22-alpine AS base
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN npm config set @navikt:registry=https://npm.pkg.github.com

WORKDIR /usr/src/app

# build app
FROM base AS build

COPY ./src ./src
COPY astro.config.mjs ./
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

RUN npm ci --ignore-scripts
RUN npm run build


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=build /usr/src/app/dist ./dist


# install dependencies ommitting dev-dependencies
FROM base AS prod-deps

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --ignore-scripts --omit=dev
# esbuild should be in devDependencies but it seems that some of subdependencies have it in prod dependencies
# Let's delete it
RUN rm -rf node_modules/esbuild
RUN rm -rf node_modules/@esbuild

# runtime
FROM gcr.io/distroless/nodejs22-debian12 AS runtime
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV TZ="Europe/Oslo"
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
