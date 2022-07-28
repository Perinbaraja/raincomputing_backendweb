const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    receivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    messageData: {
      type: String,
    },
    isAttachment: {
      type: Boolean,
      default: false,
    },
    attachments: [],
    aflag: {
      type: Boolean,
      default: true,
    },
    cleardBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    bookmarkedBy: [
      {
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        note: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
