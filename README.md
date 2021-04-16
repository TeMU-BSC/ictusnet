# ICTUSnet web application

Typifier of medical reports written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical reports and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical reports.

## Development without docker-compose

In order to run the database, the backend and the frontend, we are using three different terminal sessions:

```bash
# terminal 1
docker run --name ictusnet_mongo --rm -p 27017:27017 -v "$(realpath ./database/mongodb)":/data/db mongo:4.4.5-bionic

# terminal 2
cd backend
npm install
export ICTUSNET_NER_DIR=/home/alejandro/code/ictusnet-ner
npm run dev

# terminal 3
cd frontend
npm install
npm run dev
```

## Development with docker-compose

```bash
docker-compose down
docker-compose up --build
```
