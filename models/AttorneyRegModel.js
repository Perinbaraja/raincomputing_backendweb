const mongoose = require("mongoose");
const attorneyregSchema = mongoose.Schema({

  attorney: 
    {
      // details: 
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  attorneybarnumber: {
    type: String,
    required: true,
  },
  baradmitdate: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isattorney: {
    type: Boolean,
  },
  aflag: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("AttorneyRegModel", attorneyregSchema);
