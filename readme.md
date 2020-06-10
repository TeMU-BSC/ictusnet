# ICTUSnet web application

Tipificador de informes de alta en español de pacientes relacionados con ictus.

## Development

In one terminal:

```bash
cd backend
npm install
node app.js
```

In another terminal:

```bash
cd frontend
npm install
ng serve --proxy-config proxy.conf.json
```

## Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
