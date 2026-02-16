FROM node:24-alpine AS base
RUN corepack enable
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)
RUN pnpm config set @navikt:registry=https://npm.pkg.github.com

WORKDIR /usr/src/app

# build app
FROM base AS build

COPY ./src ./src
COPY astro.config.mjs ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

RUN pnpm install --ignore-scripts --frozen-lockfile
RUN pnpm run build


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=build /usr/src/app/dist ./dist


# install dependencies ommitting dev-dependencies
FROM base AS prod-deps

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --ignore-scripts --frozen-lockfile --prod
# esbuild should be in devDependencies but it seems that some of subdependencies have it in prod dependencies
# Let's delete it
RUN rm -rf node_modules/.pnpm/@esbuild*

# runtime
FROM gcr.io/distroless/nodejs24-debian12 AS runtime
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV TZ="Europe/Oslo"
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
