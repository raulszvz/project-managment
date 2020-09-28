FROM node:12

WORKDIR /app
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD  ["npm", "run", "start"]

