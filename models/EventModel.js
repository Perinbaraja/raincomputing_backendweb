const mongoose = require("mongoose");
const eventSchema = mongoose.Schema({
  firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegAttorney",
  },
  eventName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  responseText:[{
    type: String,
  }],
  interval: {
    type: Number,
  },
  createdAt: { type: Date, default: new Date() },
  aflag: {
    type: Boolean,
  }
})
module.exports = mongoose.model("EventModel", eventSchema);