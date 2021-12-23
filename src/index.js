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

function start() {
  const Models = require('./models')(mongoose);
  const app = require('./servers/http')(Models);

  app.listen(config.httPort, () => {
    console.log(`Server is running at port ${config.httPort}`);
  });
}

if (require.main === module) {
  start();
}
