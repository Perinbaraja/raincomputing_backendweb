const mongoose = require("mongoose");

const RemainderSchema = mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    title: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    aflag: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("remainder", RemainderSchema);
