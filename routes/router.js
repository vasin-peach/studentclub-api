const express = require("express");
const router = express.Router();

const AuthRoute = require("./api/auth");
const ClubRoute = require("./api/club");
const TeacherRoute = require("./api/teacher");
const StatusRoute = require("./api/status");

const User = require("../models/user");
const Club = require("../models/club");
const Web = require("../models/web");
const jwt = require("jsonwebtoken");
const app = express();
const keys = require("../config/keys");
const jwtDecode = require("jwt-decode");
const cookieSession = require("cookie-session");


app.set("supersecret", keys.SECRET);


// Use Cookie session
app.use(
  cookieSession({
    name: "session",
    keys: [app.get("supersecret")],
    maxAge: Math.floor(Date.now) + 3 * (60 * 60), // 6 hours
    expires: Math.floor(Date.now) + 3 * (60 * 60), // 6 hours
    httpOnly: true
  })
);
// Default route
router.get("/", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    success: true,
    status: 200,
    message: "Healthy!"
  });
});

// get session token
router.get("/session", function (req, res, next) {
  return res.status(200).send(req.session);
});

// Logout
router.post("/auth/logout", function (req, res, next) {
  req.session.token = null;
  return res.status(200).send({
    success: true
  });
});

// request token
router.post("/auth/token", function (req, res, next) {
  if (req.body.studentId && req.body.password) {

    // find user by studentId
    User.findOne({
        studentId: req.body.studentId
      },
      function (err, user) {
        if (err) throw err;

        // not found user
        if (!user) {
          return res.status(401).send({
            success: false,
            message: "Authentication failed. User not found.",
            status: 401
          });
        }

        // wrong password
        if (user.password != req.body.password) {
          return res.status(401).send({
            success: false,
            message: "Authentication failed. Wrong password.",
            status: 401
          });
        }


        const payload = {
          studentId: user.studentId,
          permission: user.permission
        };


        // jwt signin. get token
        var token = jwt.sign(payload, app.get("supersecret"), {
          expiresIn: "3h"
        });

        if (user.permission < 2) {
          Web.findOne({}, function (err, result) {
            if (result.enabled) {

              // save to cookie session
              req.session.token = token;

              // return token as JSON
              return res.json({
                success: true,
                token: token
              });

            } else {

              // return refund
              return res.status('503').send({
                success: false,
                message: "server refund student to logged in.",
                code: '503'
              })

            }
          })
        } else {

          // save to cookie session
          req.session.token = token;

          // return response
          return res.json({
            success: true,
            token: token
          });

        }
      }
    );
  } else {
    // return error
    const err = new Error("Fields required.");
    err.status = 400;
    return next(err);
  }
});

router.use("/status", StatusRoute)

// Check header have token
router.use(function (req, res, next) {
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  // decode token
  if (token) {
    jwt.verify(token, app.get("supersecret"), function (err, decoded) {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Failed to authenticate token.",
          status: 401
        });
      } else {
        //save token to routes (middleware)
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if not have token
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});

router.use("/auth", AuthRoute);
router.use("/club", ClubRoute);

// Check header is teacher
router.use(function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers["x-access-token"];
  if (token) {
    const payload = jwtDecode(token);

    // check permission
    if (payload.permission < 2) {
      return res.status(403).send({
        success: false,
        message: "Access Denied."
      });
    } else {
      next();
    }
  } else {
    // if not have token
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});
router.use('/teacher', TeacherRoute);

module.exports = router;