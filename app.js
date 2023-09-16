const express = require('express');
const bodyParser = require('body-parser');
const authRoutes=require('./routes/auth');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cors = require("cors");
  
const app = express();

app.use(bodyParser.json());

app.use(cookieParser());

app.use(cors({ origin: 'http://localhost:3000',credentials: true}));

app.use('/auth',authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose
  .connect(
    'mongodb+srv://usecase:m963GsrAwyngYE5R@cluster0.ioof7np.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));