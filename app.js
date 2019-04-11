const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const cors = require("cors");
const xlsx = require('node-xlsx');
const moment = require('moment');
const schedule = require('node-schedule');

const keys = require("./config/keys");
const Web = require('./models/web');
const User = require('./models/user');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }

);

app.use(
  cors({
    credentials: true,
    origin: true
  })
);

// connect to MongoDb
mongoose.connect(
  process.env.NODE_ENV === 'production' ?
  `mongodb://${keys.MONGO_USER}:${keys.MONGO_PASS}@${keys.MONGO_URI}/${keys.MONGO_DB}` :
  `mongodb://${keys.MONGO_URI}/${keys.MONGO_DB}`
);
const db = mongoose.connection;

//handle mongo error
db.on("error", console.error.bind(console, "connection to mongodb error:"));
db.once("open", function () {
  console.log("connection to mongodb");
});

// use sessions for tracking logins
app.use(session({

    secret: keys.SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
      }

    )
  }

));

// set secret
app.set("supersecret", keys.SECRET); // secret variable

// parse incoming request
app.use(bodyParser.json({
    limit: "10mb"
  }

));

// in latest body-parser use like below.
app.use(bodyParser.urlencoded({
    limit: "10mb",
    extended: false
  }

));

// init open and close web
Web.findOne({}

  ,
  function (err, result) {
    if (!err && !result) {
      Web.create({
          enabled: true
        }

      )
    }
  }

) // init admin

User.findOne({}

  ,
  function (err, result) {
    if (!err && !result) {
      User.create({

          "studentId": "00000",
          "password": "1234567812345",
          "permission": 2,
          "prefix": "นาย",
          "firstname": "พีระเทพ",
          "lastname": "กาวินชัย",
          "tel": null,
          "club": null,
          "admission_date": null,
          "education": {
            "level": 0,
            "class": 0
          }
        }

      )
    }
  }

) // include routes
const routes = require("./routes/router");
app.use("/api", routes);

// listen on port 3000
app.listen(keys.PORT, function () {
    console.log(`Running Studentclub API [${process.env.NODE_ENV}][${keys.PORT}]`);
  }

);