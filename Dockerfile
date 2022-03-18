FROM node:lts-alpine

# set workdir
WORKDIR /backend

# npm stuff
COPY package.json ./
RUN npm install
COPY . .

# port
EXPOSE 8080

# start application
CMD ["npm", "start"]