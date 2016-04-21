FROM node:argon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package.json 

ADD . .
ADD houndify-0.3.2.tgz .

RUN npm install -g gulp
RUN npm install

EXPOSE 3000

CMD ["gulp"]


