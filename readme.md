# ICTUSnet web application

Typifier of medical documents written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical documents and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical documents.

## Development

### Method A: Using three different terminal windows

```bash
# terminal 1
docker run --name ictusnet_mongo --rm -p 27017:27017 -v "$(realpath ./database/mongodb)":/data/db mongo

# terminal 2
cd backend
npm install
npm run dev

# terminal 3
cd frontend
npm install
npm run dev
```

### Method B: Using three different terminal windows

```bash
docker-compose up --build
```

## Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
