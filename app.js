require("dotenv").config()
const express = require("express")
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json());

const apiRouter = require('./api');
app.use('/api', apiRouter);
app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status);
        delete err.status;
        res.send(err);
    }
    res.status(500).send(err);
});

app.use((req, res, next) => {
    res.status = 404
    res.body = {message: "doesn't exist"}
    res.send(res.status, res.body)
})

module.exports = app;
