const express = require("express");
const router = express.Router();
const jwtDecode = require("jwt-decode");
const cookieSession = require("cookie-session");

const User = require("../../models/user");

// Check token expired
router.post("/check", function (req, res) {
  return res.status(200).send({
    success: true,
    message: "Ok.",
    code: 200
  });
});

// Add user
router.post("/add", function (req, res, next) {
  if (req.body.studentId && req.body.password) {
    User.find({
      studentId: req.body.studentId
    }, function (err, data) {
      if (data.length != 0) {
        // check user has exist
        return res.json({
          success: false,
          message: "Failed to create user. User has exist."
        });
      }

      // get token and decode
      const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
      const payload = jwtDecode(token);

      // check permission
      if (payload.permission < 2) {
        return res.status(403).send({
          success: false,
          message: "Access Denied."
        });
      }

      // create a user object
      const userData = {
        studentId: req.body.studentId,
        password: req.body.password,
        permission: 1,
        education: {
          level: req.body.education.level || "",
          class: req.body.education.class || ""
        },
        telephone: req.body.telephone,
        start_at: req.body.start_at,
        created_on: Date.now()
      };

      // create user
      User.create(userData, function (err, user) {
        if (err) {
          return next(err);
        } else {
          console.log("User " + userData.studentId + " has been added.");
          return res.json({
            success: true
          });
        }
      });
    });
  } else {
    // return error
    const err = new Error("Fields required.");
    err.status = 400;
    return next(err);
  }
});

// Update
router.post("/update", function (req, res, next) {
  if (req.body.payload) {
    // method not allow
    if (
      req.body.payload.permission ||
      req.body.payload._id ||
      req.body.payload.studentId
    ) {
      return res
        .status(405)
        .send({
          success: false,
          message: "methods not allow.",
          code: 405
        });
    }

    // get token decode and update
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    var decode = jwtDecode(token);
    var query = {
      studentId: decode.studentId
    };
    User.update(query, req.body.payload, function (err, user) {
      console.log(
        "user " +
        decode.studentId +
        " was update: " +
        JSON.stringify(req.body.payload, null, 2)
      );
      return res.json({
        success: true,
        message: "ok",
        code: 200,
        data: user
      });
    });
  } else {
    // return error
    return res
      .status(400)
      .send({
        success: false,
        message: "fields required.",
        code: 400
      });
  }
});

// get self
router.post("/self", function (req, res, next) {

  // check web enabled


  // get token and decode
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  var decode = jwtDecode(token);
  var query = {
    studentId: decode.studentId
  };
  User.findOne(query, function (err, user) {
    if (!err) {
      return res.json({
        success: true,
        message: "ok",
        code: 200,
        data: user
      });
    }
  });
});

module.exports = router;