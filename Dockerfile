FROM node:lts-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE 3002
RUN npm run build
CMD ["node", "dist/app.js"]