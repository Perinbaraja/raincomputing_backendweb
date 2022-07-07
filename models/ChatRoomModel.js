const mongoose = require("mongoose");
const ChatRoomSchema = mongoose.Schema({
  members: [
    {
      // details: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    //   isAdmin: {
    //     type: Boolean,
    //   },
    // },
  ],

  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
  },
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
module.exports = mongoose.model("ChatRooms", ChatRoomSchema);
