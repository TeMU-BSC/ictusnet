# ICTUSnet web application

Typifier of medical reports written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical reports and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical reports.

## Development

```bash
# terminal 1
docker run -p 27017:27017 -v "$(realpath ./database/mongodb)":/data/db mongo

# terminal 2
cd backend
npm install
npm run dev

# terminal 3
cd frontend
npm install
npm run dev
```

## Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
