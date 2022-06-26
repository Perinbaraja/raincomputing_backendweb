const express = require("express");
const ChatRooms = require("../models/ChatRoomModel");
const Chat = require("../models/ChatModel");
const router = express.Router();

router.post("/createChatRoom", async (req, res) => {
  console.log("starting creation");
  try {
    const { members } = req.body;
    console.log("Members :", members);
    ChatRooms.create({ members }, (err, room) => {
      if (err) {
        return res.json({ msg: err });
      } else {
        return res.json({ success: true, room });
      }
    });
  } catch (err) {
    return res.json({ msg: err });
  }
});

router.post("/getChatRoomById", async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    ChatRooms.findById(chatRoomId)
      .populate("members.details")
      .exec((err, chat) => {
        if (err) {
          return res.json({ msg: err });
        } else {
          return res.json({ success: true, chat });
        }
      });
  } catch (err) {
    return res.json({ msg: "error" });
  }
});

router.post("/sendMessage", async (req, res) => {
  try {
    const { sender, receivers, chatRoomId, messageData } = req.body;
    const messageQuery = {
      chatRoomId,
      message: {
        sender,
        receivers,
        messageData,
      },
    };
    Chat.create(messageQuery, (err, message) => {
      if (err) {
        return res.json({ msg: err });
      } else {
        return res.json({ success: true, message });
      }
    });
  } catch (err) {
    console.log(err);
    return res.json({ msg: err });
  }
});

router.post("/getRoomMessages", async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    Chat.find({ chatRoomId })
      .populate("message.sender")
      .populate("message.receivers")
      .exec((err, roomMessages) => {
        if (err) {
          console.log(err);
          return res.json({ msg: err });
        } else {
          return res.json({ success: true, roomMessages });
        }
      });
  } catch (err) {
    console.log(err);
    return res.json({ msg: "error" });
  }
});

module.exports = router;
