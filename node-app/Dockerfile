# Base Image
# FROM ubuntu
FROM node:20.17.0-alpine3.20

# install node.js
# RUN -> to run the command in the container
# RUN apt update
# RUN apt install -y curl
# RUN curl -sL https://deb.nodesource.com/setup_18.x -o /tmp/nodesource_setup.sh
# RUN bash /tmp/nodesource_setup.sh
# RUN apt install -y nodejs

# setting the working dir (cd to /home/app/)
# after setting the workdir, all the below commands will be run in the workdir
WORKDIR /home/app

# copy source code into docker's image
# if the package.json changes, we have to run the npm install again.
COPY package.json package.json
COPY package-lock.json package-lock.json

# once in the workdir, install the pkg
RUN npm -y install 

# If the index file changes, we dont have to run the npm install again.
COPY index.js index.js

# If this image is run, run this command automatically
CMD ["npm", "start"]

ENV PORT=8000
EXPOSE 8000

# RUN -> execute when docker build
# CMD -> execute when docker run

# If anything changes in the layer (each line is layer), all the below layers will rerun