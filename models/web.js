const mongoose = require("mongoose");

const WebSchema = new mongoose.Schema({
  enabled: {
    type: Boolean
  }
});


const Web = mongoose.model("Web", WebSchema);
module.exports = Web;