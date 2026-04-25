# ---------- BASE ----------
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Public build-time variables from Dokploy Build Arguments.
# Runtime-only secrets should stay in Dokploy Environment Variables.
ARG VITE_APP_URL
ENV VITE_APP_URL=${VITE_APP_URL}

# build
RUN bun run build

# ---------- RUNTIME ----------
# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.output ./.output
COPY --from=prerelease /usr/src/app/package.json .

# run the app
ENV NITRO_PORT=3001
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]
