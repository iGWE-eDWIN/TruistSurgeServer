'use strict';
require('dotenv').config();
require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRouter = require('./routers/user');
const adminRouter = require('./routers/admin');
const { createSystemAdmin } = require('./controller/admin');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routers
app.use(userRouter);
app.use(adminRouter);

// createSystem admin
// createSystemAdmin();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello there');
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
