const mongoose = require("mongoose");

const RemainderSchema = mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    selectedMembers:[
      {
        _id: false,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
      }
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
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
    scheduledTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("remainder", RemainderSchema);
