VERSION 0.6

FROM node:16

yarn-base:
    COPY ./package.json ./
    COPY ./yarn.lock ./
    RUN yarn install
    # Output these back in case npm install changes them.
    SAVE ARTIFACT package.json AS LOCAL ./package.json
    SAVE ARTIFACT yarn.lock AS LOCAL ./package-lock.json

code:
    FROM +yarn-base
    COPY --dir src .

lint:
    FROM +code
    COPY .eslintrc.js .
    RUN yarn lint

compile:
    FROM +code
    COPY tsconfig.json .
    RUN yarn package
    SAVE ARTIFACT dist AS LOCAL dist
    SAVE ARTIFACT node_modules AS LOCAL node_modules

test:
    FROM +code
    COPY tsconfig.json .
    COPY jest.config.js .
    RUN yarn test

all:
    BUILD +lint
    BUILD +compile
    BUILD +test
