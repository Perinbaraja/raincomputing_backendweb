const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetLink :{
    type: String,
    default:""
  },
  verified: {
    type: Boolean,
    default:false,
    required:true,

  },
  aflag: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  attorneyStatus: {
    type: String,
  },
  lastModified: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("UserModel", userSchema);
