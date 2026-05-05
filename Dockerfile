FROM node:24-alpine AS base
RUN corepack enable
RUN pnpm config set @navikt:registry=https://npm.pkg.github.com

WORKDIR /usr/src/app

# build app
FROM base AS build

COPY ./src ./src
COPY astro.config.mjs ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile && \
    pnpm config delete //npm.pkg.github.com/:_authToken
RUN pnpm run build


# export build to filesystem (GitHub)
FROM scratch AS export
COPY --from=build /usr/src/app/dist ./dist


# install dependencies ommitting dev-dependencies
FROM base AS prod-deps

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    pnpm install --ignore-scripts --frozen-lockfile --prod && \
    pnpm config delete //npm.pkg.github.com/:_authToken
# esbuild should be in devDependencies but it seems that some of subdependencies have it in prod dependencies
# Let's delete it
RUN rm -rf node_modules/.pnpm/@esbuild*

# runtime
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24@sha256:23979bd625df98be838ca0dd02ae57e73f93c633243e6106ee21e260bba9bc28 AS runtime
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV TZ="Europe/Oslo"
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
