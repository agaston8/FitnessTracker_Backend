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

// const PORT = process.env["PORT"] ?? 3000
// const server = http.createServer(app)
// const {client} = require("./client")

// server.listen(PORT, ()=>{
//    client.connect();
//     console.log('The server is up on port', PORT);
// })
// const {PORT} = require("./server")
// const {client} = require("./db/client")

// app.listen(PORT, async () => {
//     try{
//       await client.connect()
//       console.log('The server is up on port', PORT)
//     } catch (error) {
//       console.error(error)
//       throw error
//     }
//   });

// Setup your Middleware and API Router here
// app.use((req, res, next) => {
//     console.log("<____Body Logger START____>");
//     console.log(req.body);
//     console.log("<_____Body Logger END_____>");
  
//     next();
//   });
