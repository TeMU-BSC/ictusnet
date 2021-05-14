# ICTUSnet web application

Typifier of medical reports written in Spanish of patients related to stroke (ictus).

This is a webapp that allows to upload medical reports and displays a categorized interactive form in order to help medical stuff with the classifying task of the ictus medical reports.

```bash
git clone https://github.com/TeMU-BSC/ictusnet-webapp.git
```

To obtain the **deeplearning model** that is needed for the annotation pipeline, please contact aitor.gonzalez@bsc.es or joan.lloppalao@bsc.es.

After cloning this repository either for development or for production, copy the deeplearning model to the `backend` subdirectory:

- Locally:

```bash
cp -r /home/alejandro/code/ictusnet-webapp/backend/model/ /var/www/html/ictusnet-webapp/backend/
```

- Remotely:

```bash
scp -r /home/alejandro/code/ictusnet-webapp/backend/model/ aasensio@temu.bsc.es:/var/www/html/ictusnet-webapp/backend/
```

## Development

```bash
cd frontend && npm install && cd .. && cd backend && npm install && cd ..
docker-compose up
Ctrl+C
docker-compose down
```

Visit http://localhost:4200.

## Fake-production (temporal)

```bash
cd frontend && npm install && cd .. && cd backend && npm install && cd ..
docker-compose -f fake-production.yml up --build -d
docker-compose -f fake-production.yml down
```

Visit http://yourdomain:81.

## Production (not ready yet)

```bash
docker-compose -f production.yml up --build -d
docker-compose -f production.yml down
```

Visit http://yourdomain:81.
