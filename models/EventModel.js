const mongoose = require("mongoose");
const eventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  aflag: {
    type: Boolean,
  }
})
module.exports = mongoose.model("EventModel", eventSchema);