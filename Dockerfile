FROM node:12-alpine

RUN mkdir /app

WORKDIR /app

COPY . .

RUN yarn install \
  && yarn build \
  && rm -R node_modules \
  && yarn install --production=true

CMD ["npm", "run", "start:prod"]
