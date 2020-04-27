FROM mongo

RUN mkdir -p /home/mongodb && chown mongodb:mongodb /home/mongodb

COPY ./docker/mongodb/002_users.js /docker-entrypoint-initdb.d/002_users.js
