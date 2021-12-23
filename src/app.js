const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('Connected successfully');
});

const app = express();

app.get('/', (request, res) => {
  res.send('Hello Resor');
});

app.listen(config.httPort, () => {
  console.log('Server is running at port 3000');
});
