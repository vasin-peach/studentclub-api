const express = require("express");
const router = express.Router();

const Web = require("../../models/web");

// Update
router.get('/enabled', function (req, res, next) {
  Web.findOne({}, function (err, result) {
    if (!err) {
      return res.json({
        success: true,
        data: result,
        code: 200
      })
    } else {
      return res.status(404).send({
        success: false,
        data: err,
        code: 400
      })
    }
  })
})

module.exports = router;