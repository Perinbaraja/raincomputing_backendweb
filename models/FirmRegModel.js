const mongoose = require("mongoose");
const firmregSchema = mongoose.Schema({

  attorney: 
    {
      // details: 
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  firmname: {
    type: String,
    required: true,
  },
  firmaddress: {
    type: String,
    required: true,
  },
  llcno: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  firmid: {
    type: String,
    required: true,
  },
  // declaration: {
  //   type: String,
  //   required: true,
  // },
  aflag: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("FirmRegModel", firmregSchema);
