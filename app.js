require("dotenv").config()
const express = require("express")
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json());


const apiRouter=require('./api');
app.use('/api', apiRouter);

module.exports = app;
