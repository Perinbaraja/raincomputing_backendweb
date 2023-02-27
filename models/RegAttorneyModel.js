const mongoose = require("mongoose");

const RegAttorneySchema = mongoose.Schema({
  regUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  registerNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  firm: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: Number,
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
