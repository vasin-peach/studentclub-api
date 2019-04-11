# Runner build
FROM node:9-alpine

WORKDIR /home/studentclub-api.prod/
RUN mkdir /clubs

COPY . ./

RUN yarn install

EXPOSE 3000

CMD [ "yarn", "start" ]

