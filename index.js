require('dotenv').config();

const initializeSocketIO = require("./socketio");
const cors = require('cors');
const express = require('express');
const { connectToDatabase } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const http = require('http');
const route = require('./routes/router');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(route);

app.use(errorHandler);

const server = http.createServer(app);

initializeSocketIO(server);

connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });
