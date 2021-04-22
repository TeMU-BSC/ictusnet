# ICTUSnet web application

Typifier of medical reports written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical reports and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical reports.

## Development

```bash
docker-compose down
docker-compose up --build
```

## Production

```bash
docker-compose -f production.yml down
docker-compose -f production.yml up --build
```
