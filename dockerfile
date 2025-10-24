FROM node:lts-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the dev port
EXPOSE ${PORT}

# Run NestJS in development mode (hot reload)
CMD ["npm", "run", "start:dev"]