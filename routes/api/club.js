const express = require("express");
const router = express.Router();
const jwtDecode = require("jwt-decode");
const cookieSession = require("cookie-session");
const fs = require("fs");

const Club = require("../../models/club");
const User = require("../../models/user");

// -- Add club -- //

router.post("/add", function (req, res, next) {
  if (req.body.name) {
    Club.find({
        name: req.body.name
      },
      function (err, data) {
        if (data.length != 0) {
          // check club has exist
          return res.status(409).send({
            success: false,
            message: "Failed to create club. Club has exist."
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

        function saveImage() {
          return new Promise((resolve, reject) => {
            // store an img in binary
            base64Data = req.body.img
              .replace(/^data:image\/png;base64,/, "")
              .replace(/^data:image\/jpeg;base64,/, "")
              .replace(/^data:image\/gif;base64,/, "");
            binaryData = new Buffer(base64Data, "base64").toString("binary");
            var fileName =
              "/clubs/" +
              Date.now() +
              "." +
              req.body.img
              .split(",")[0]
              .split(";")[0]
              .split("/")[1];
            fs.writeFile(fileName, binaryData, "binary", function (
              err,
              response
            ) {
              if (err) {
                return reject(err);
              }
              resolve(fileName);
            });
          });
        }

        saveImage()
          .then(fileName => {
            // create a club object
            const clubData = {
              name: req.body.name,
              owner: req.body.owner,
              img: fileName.split("/")[fileName.split("/").length - 1] ||
                "default.png",
              desc: req.body.desc || null,
              entry: {
                max: req.body.entry.max || 100
              },
              receive: req.body.receive
            };

            // create club
            Club.create(clubData, function (err, club) {
              if (err) {
                return next(err);
              } else {
                console.log("Club " + clubData.name + " has been added.");
                return res.json({
                  success: true
                });
              }
            });
          })
          .catch(err => {
            console.log(err);
            res.status(405).send({
              success: false,
              message: err
            });
          });
      }
    );
    // const User = require("../../models/user");
  } else {
    // return error
    const err = new Error("Fields required.");
    err.status = 400;
    return next(err);
  }
});

// -- Get club -- //
router.post("/get", function (req, res, next) {
  Club.find({}, function (err, data) {
    if (data.length) {
      // success
      return res.status(200).send({
        success: true,
        message: "success",
        code: 200,
        data: data
      });
    } else {
      // club not found
      return res.status(403).send({
        success: false,
        message: "Club not found.",
        code: 403
      });
    }
  });
});

// -- Update Entry Current -- //
router.post("/update/current/", function (req, res, next) {
  if (req.body) {
    // method not allow
    if (req.body.amount && req.body.name) {
      var query = {
        name: req.body.name
      };

      // check current overflow or underflow
      function checkOverflow() {
        return new Promise((resolve, reject) => {
          Club.findOne(query, function (err, data) {
            if (data.entry.current + req.body.amount > data.entry.max) {
              res.status(403).send({
                success: false,
                message: "request refusing. current overflow.",
                code: 403
              });
              return reject();
            } else if (data.entry.current + req.body.amount < 0) {
              res.status(403).send({
                success: false,
                message: "request refusing. current underflow.",
                code: 403
              });
              return reject();
            } else {
              return resolve();
            }
          });
        });
      }

      checkOverflow().then(() => {
        // find and increse
        Club.findOneAndUpdate(
          query, {
            $inc: {
              "entry.current": req.body.amount
            }
          },
          function (err, response) {
            // show on log
            console.log("club " + req.body.name + " was update current");

            // return 200
            return res.json({
              success: true,
              message: "ok",
              code: 200,
              data: response
            });
          }
        );
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "field required.",
        code: 400
      });
    }
  } else {
    // return error
    return res.status(400).send({
      success: false,
      message: "fields required.",
      code: 400
    });
  }
});

// -- Remove Club -- //
router.post("/remove", function (req, res, next) {
  if (req.body.name) {
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

    function removeStudentEntry(clubName) {
      return new Promise((resolve, reject) => {
        // User.find({ club: req.body.name })
        User.updateMany({
            club: clubName
          }, {
            $set: {
              club: null
            }
          },
          (err, result) => {
            if (!err && result) {
              return resolve(result);
            }
            reject(err);
          }
        );
      });
    }

    function removeImage(filename) {
      return new Promise((resolve, reject) => {
        //dev var path = "../studentclub-nbr/static/clubs/" + filename;
        var path = "/clubs/" + filename;
        fs.unlink(path, function (err, response) {
          if (!err) {
            return resolve(response);
          }
          // case image not exist --> remove data in db
          Club.remove({
            name: req.body.name
          }, function (err, result) {
            if (!err) {
              console.log(
                "Club " + req.body.name + " has been remove (without image)"
              );
              return res.status(200).send({
                success: true,
                message: "remove success (without image)",
                code: 200,
                data: err
              });
            }
          });
        });
      });
    }

    Club.findOne({
      name: req.body.name
    }, function (err, result) {
      if (!err && result) {
        // remove student entry club
        removeStudentEntry(req.body.name);

        // remove club image
        removeImage(result.img)
          .then((err, result) => {
            if (!err) {
              // remove club
              Club.remove({
                name: req.body.name
              }, function (err, response) {
                if (!err) {
                  console.log("Club " + req.body.name + " has been remove.");
                  return res.status(200).send({
                    success: true,
                    message: "remove success.",
                    code: 200,
                    data: response
                  });
                } else {
                  return res.status(503).send({
                    success: false,
                    message: err,
                    code: 503
                  });
                }
              });
            } else {
              return res.status(503).send({
                success: false,
                message: err,
                code: 503
              });
            }
          })
          .catch(err => {
            return res.status(400).send({
              success: false,
              message: err,
              code: 400
            });
          });
      } else {
        return res.status(503).send({
          success: false,
          message: "request duplicate data not found in db.",
          code: 503
        });
      }
    });
  } else {
    // return error
    return res.status(400).send({
      success: false,
      message: "fields required.",
      code: 400
    });
  }
});

module.exports = router;