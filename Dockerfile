
FROM node:22-bullseye AS dependencies

WORKDIR /usr/dependencies

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

FROM node:22-bullseye AS builder

WORKDIR /usr/builder

COPY --from=dependencies /usr/dependencies/node_modules ./node_modules

COPY package.json .
COPY yarn.lock .
COPY public ./public
COPY src ./src
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.js .

ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY .docker/.docker.env ./.env

COPY prisma ./prisma

RUN yarn prisma generate
RUN yarn build

FROM node:22-bullseye AS runner

WORKDIR /usr/runner

COPY --from=dependencies /usr/dependencies/node_modules ./node_modules
COPY --from=builder /usr/builder/package.json ./package.json
COPY --from=builder /usr/builder/.next ./.next
COPY --from=builder /usr/builder/public ./public
COPY --from=builder /usr/builder/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/builder/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /usr/builder/postcss.config.js ./postcss.config.js
COPY prisma ./prisma
COPY src/firstCheck.ts ./src/firstCheck.ts

COPY .docker/docker-runtime.env.sh /usr/runner/docker-runtime.env.sh
RUN chmod +x /usr/runner/docker-runtime.env.sh

EXPOSE 80

CMD ["/bin/bash", "-c", "/usr/runner/docker-runtime.env.sh && rm -rf /usr/runner/docker-runtime.env.sh && yarn db:generate && yarn start"]