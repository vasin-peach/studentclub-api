# Runner build
FROM node:8-alpine

WORKDIR /home/studentclub-api.prod/
RUN mkdir /clubs

COPY . ./

RUN yarn install

EXPOSE 3000

CMD [ "yarn", "start" ]

