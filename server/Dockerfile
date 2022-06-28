FROM node:14


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install uuid express dse-driver dotenv cors body-parser nodemon avsc cassandra-driver
# Bundle app source
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]
