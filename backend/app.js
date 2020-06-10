const express = require('express')
const app = express()
const port = 3000
const bodyParser = require("body-parser");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './uploads'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.json({
        'greeting': 'hello from express.'
    });
});

app.post('/api/upload', multipartMiddleware, (req, res) => {
    res.json({
        'message': 'Files uploaded succesfully to "./backend/uploads/".'
    });
});

app.listen(port, () => console.log(`Ictusnet backend listening on port ${port}!`))
