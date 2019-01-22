const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes');
//const errorHandler = require('./lib/errorHandler');

const app = express();

const errorHandler = function(error, req, res, next) {
    // Any request to this server will get here, and will send an HTTP
    // response with the error message 'woops'
    res.status(500).json({ 
        code: 'Internal Server Error',
        message: error.message 
    });
};

app.use(cors({
    allowedHeaders: 'Origin, Content-Type, Accept, X-Requested-With'
}));
app.disable('x-powered-by');
app.use(bodyParser.json());

let port = process.env.PORT || 8080;

app.use('/', routes);

app.use(errorHandler);

app.listen(port, () => console.log('App listening on port: ' + port));
module.exports = app;