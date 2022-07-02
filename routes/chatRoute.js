const express = require("express");
const ChatRooms = require("../models/ChatRoomModel");
const Chat = require("../models/ChatModel");
const router = express.Router();

router.post("/createChatRoom", async (req, res) => {
  const { members, isGroup, groupName } = req.body;
  let roomQuery = {
    members: members.sort(),
  };
  if (isGroup) {
    roomQuery.isGroup = isGroup;
    roomQuery.groupName = groupName || "Group chat";
  }
  // console.log("roomQuery : ", roomQuery);

  try {
    const { members } = req.body;
    ChatRooms.find({ members: members.sort() }, (err, isRoom) => {
      if (err) {
        return res.json({ msg: err });
      } else {
        if (isRoom.length < 1) {
          ChatRooms.create(roomQuery, (err, room) => {
            if (err) {
              return res.json({ msg: err });
            } else {
              ChatRooms.findById(room._id)
                .populate("members")
                .exec((err, chat) => {
                  if (err) {
                    return res.json({ msg: err });
                  } else {
                    return res.json({ success: true, room: chat });
                  }
                });
              // return res.json({ success: true, room });
            }
          });
        } else {
          ChatRooms.findById(isRoom[0]._id)
            .populate("members")
            .exec((err, chat) => {
              if (err) {
                return res.json({ msg: err });
              } else {
                return res.json({ success: true, room: chat });
              }
            });
          // return res.json({ success: true, room: isRoom[0] });
        }
      }
    });
  } catch (err) {
    return res.json({ msg: err });
  }
});

router.post("/getAllChatRoomByUserId", async (req, res) => {
  try {
    const { userID } = req.body;
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    ChatRooms.find({ members: userID }, null, {
      limit,
      skip,
      // sort: { createdAt: -1 },
    })
      .populate({
        path: "members",
        select: "firstname lastname",
        // match: { _id: { $ne: userID } },
      })
      .exec((err, chats) => {
        if (err) {
          return res.json({ msg: err });
        } else {
          return res.json({ success: true, chats });
        }
      });
  } catch (err) {
    return res.json({ msg: "error" });
  }
});

router.post("/getChatRoomById", async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    ChatRooms.findById(chatRoomId)
      .populate("members")
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
    return res.json({ msg: err });
  }
});

router.post("/getRoomMessages", async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    Chat.find({ chatRoomId })
      // .populate("message.sender")
      // .populate("message.receivers")
      .exec((err, messages) => {
        if (err) {
          return res.json({ msg: err });
        } else {
          return res.json({ success: true, messages });
        }
      });
  } catch (err) {
    return res.json({ msg: "error" });
  }
});

module.exports = router;
