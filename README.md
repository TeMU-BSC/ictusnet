# ICTUSnet web application

Typifier of medical reports written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical reports and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical reports.

> To obtain the **deeplearning model** that is needed for the annotation pipeline, please contact aitor.gonzalez@bsc.es or joan.lloppalao@bsc.es.

## Development

```bash
docker-compose down
cd frontend && npm install && cd .. && cd backend && npm install && cd ..
docker-compose up --build
```

Visit http://localhost:4200.

## Fake-production (temporal)

```bash
docker-compose -f fake-production.yml down
cd frontend && npm install && cd .. && cd backend && npm install && cd ..
docker-compose -f fake-production.yml up --build -d
```

Visit http://yourdomain:81.

## Production (not ready yet)

```bash
docker-compose -f production.yml down
docker-compose -f production.yml up --build -d
```

Visit http://yourdomain:81.
