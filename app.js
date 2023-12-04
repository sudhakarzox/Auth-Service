const express = require('express');
const bodyParser = require('body-parser');
const authRoutes=require('./routes/auth');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./doc/swagger.yaml');
  
const app = express();

app.use(bodyParser.json());

app.use(cookieParser());

app.use(morgan('tiny'));

app.use(cors({ origin: 'http://localhost:3000',credentials: true}));

app.use('/auth',authRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((error, req, res, next) => {
    console.log(error.message);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose
  .connect(
    'uri'
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));

  module.exports = app;
