const mongoose = require("mongoose");

const RegAttorneySchema = mongoose.Schema({
  regUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  barNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  aflag: {
    type: Boolean,
  },
  regAt: {
    type: Date,
    default: Date.now(),
  },
  lastModified: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("RegAttorney", RegAttorneySchema);
