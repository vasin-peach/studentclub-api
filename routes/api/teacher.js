const express = require("express");
const router = express.Router();

const Club = require("../../models/club");
const User = require("../../models/user");
const Web = require("../../models/web");

router.post('/option/enabled', function (req, res) {
  if (req.body) {
    Web.findOne({}, function (err, result) {
      result.enabled = req.body.data
      result.save();

      res.json({
        success: true,
        message: 'web enabled update to: ' + req.body.data,
        data: result,
        code: 200
      })
    })
  }
})

router.post('/user/club', function (req, res) {
  if (req.body.data) {

    // find user by club
    User.find({
      'club': {
        $in: req.body.data
      }
    }, function (err, result) {
      if (!err) {
        res.json({
          success: true,
          data: result,
          code: 200
        })
      }
    })

  } else {

    // bad request
    res.status(400).send({
      success: false,
      message: 'methods not found.',
      code: 400
    })

  }
})

// Get all user
router.post("/user/all", function (req, res) {
  // find all user
  User.find({
    permission: {
      $lt: 3
    }
  }, function (err, users) {
    if (err) {
      // return error
      return next(err);
    } else {
      // return data
      return res.json({
        success: true,
        users
      });
    }
  });
});

// Get all club
router.post("/club/all", function (req, res) {
  // find all user
  Club.find({}, function (err, clubs) {
    if (err) {
      // return error
      return next(err);
    } else {
      // return data
      return res.json({
        success: true,
        clubs
      });
    }
  });
});

// Remove User
router.post("/user/remove", function (req, res) {

  var studentId = []

  // decrease club user entry
  req.body.data.data.forEach(item => {
    if (item) {
      // create sId array
      studentId.push(item.studentId);

      // check user entry club
      if (item.club && item.permission < 2) {
        Club.update({
          name: item.club
        }, {
          $inc: {
            'entry.current': -1
          }
        }, function (err, result) {
          if (!err) console.log(item.club + ' number of entry decrease.');
        });
      }
    }
  })

  User.deleteMany({
    studentId: {
      $in: studentId
    },
    permission: 1
  }, function (err, result) {
    if (!err) {
      return res.status(200).send({
        success: true,
        message: "remove user success",
        code: 200,
        data: err
      });
    } else {
      return res.status(403).send({
        success: true,
        message: "remove user error",
        code: 403,
        data: err
      });
    }
  })
});

// Add User
router.post("/user/add", function (req, res) {

  var studentList = req.body.data.data;
  var studentPayload = [];

  studentList.slice(1).forEach(function (item) {
    studentPayload.push({
      studentId: item.student_id,
      password: item.id_card,
      permission: 1,
      prefix: item.prefix,
      firstname: item.firstname,
      lastname: item.lastname,
      tel: item.tel || null,
      club: null,
      education: {
        level: item.level,
        class: item.class,
      }
    })
  })

  studentList.slice(1).forEach(function (item) {
    User.findOne({
      studentId: item.studentId
    }, function (err, user) {
      if (!err) {
        if (!user) {
          user = new User();
          user.studentId = item.student_id;
          user.password = item.id_card;
          user.permission = 1;
          user.prefix = item.prefix;
          user.firstname = item.firstname;
          user.lastname = item.lastname;
          user.tel = item.tel || null;
          user.club = null;
          user.education.level = item.level;
          user.education.class = item.class;
          user.admission_date = item.admission_date;
        }
        user.save(function (err) {
          if (!err) {
            console.log("Success: studentid: " + user.studentId + ' added.')
          } else {
            if (err.code == 11000) {
              console.log("Error: user " + user.studentId + ' already exist.')
            } else {
              console.log("Error: could not add user code: " + err);
            }
          }
        })
      }
    });
  })
  return res.status(200).send({
    success: true,
    message: "add success",
    code: 200,
  });


});




module.exports = router;