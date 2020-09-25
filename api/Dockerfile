FROM node:12

WORKDIR /app
COPY package*.json ./

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
	then npm install;  \
	else npm install --only=production; \
	fi

# Bundle app source
COPY . .

CMD  ["npm", "run", "start"]

