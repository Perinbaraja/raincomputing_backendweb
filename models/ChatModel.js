const mongoose = require("mongoose");
const ChatSchema = mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
  },

  message: {
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
    messageData: { type: String, required: true },
  },

  isAttachment: { type: Boolean, default: false },
  attachments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachments",
    },
  ],
  aflag: { type: Boolean, default: true },
  lastModified: {
    type: Date,
    default: Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
module.exports = mongoose.model("Chats", ChatSchema);
