FROM node:9-alpine

ADD . /usr/src/app/backend
WORKDIR /usr/src/app/backend
RUN mkdir /clubs

RUN yarn

EXPOSE 3000

CMD ["yarn", "start"];