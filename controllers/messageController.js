const config = require("../config");
const Message = require("../models/Message");

const SENDMESSAGE = async (req, res) => {
  try {
    const {
      caseId,
      groupId,
      sender,
      receivers,
      messageData,
      isAttachment,
      attachments,
      isForward,
    } = req.body;
    const messageQuery = {
      groupId,
      sender,
      receivers,
      messageData,
      isAttachment,
      attachments,
      isForward,
    };
    if (caseId) {
      messageQuery.caseId = caseId;
    }
    const createdMessage = await Message.create(messageQuery);
    if (createdMessage) return res.json({ success: true, createdMessage });
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};
const REPLYMESSAGE = async (req, res) => {
  try {
    const {
      id,
      sender,
      msg
    } = req.body;
    const replyQuery = {
      sender,
      replyMsg:msg,
    };
    const replyMessage = await Message.findByIdAndUpdate(id, {
      $push: { replies: replyQuery },
    });;
    if (replyMessage) return res.json({ success: true, replyMessage });
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

const GETMESSAGES = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const groupMessages = await Message.find({
      groupId,
      aflag: true,
      cleardBy: { $ne: [userId] },
    });
    if (groupMessages)
      return res.json({
        success: true,
        groupMessages,
      });
  } catch (err) {
    console.log(err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};
const GETMESSAGEBYID = async (req, res) => {
  try {
      const { msgId } = req.body;
      Message.findById(msgId, async (err, Msg) => {
        if (err) {
          return res.json({
            msg: err,
          });
        } else if (Msg) {
          return res.json({
            success: true,
            Msg,
          });
        } else {
          return res.json({
            msg: `No Msg Found `,
          });
        }
      });
    } catch (err) {
      return res.json({
        msg: err,
      });
    }
  };
const GETFILES = async (req, res) => {
  try {
    const { caseId, searchText = "" } = req.body;
    const filesQuery = {
      caseId,
      aflag: true,
      isAttachment: true,
      "attachments.aflag": true,
      "attachments.name": { $regex: "^" + searchText, $options: "i" },
    };
    const files = await Message.find(filesQuery).populate({
      path: "sender",
      select: "firstname lastname _id",
    });
    if (files?.length > 0) {
      let struturedFiles = [];
      files.map((f) => {
        const senderName = f?.sender?.firstname + " " + f?.sender?.lastname;
        const senderId = f?.sender?._id;
        const time = f?.createdAt;
        f?.attachments?.map((a) => {
          const typeIndex = a?.name.indexOf(".");
          const type = a?.name.slice(typeIndex !== 0 ? typeIndex + 1 : 0);
          const size = a?.size;
          const id = a?.id;
          const name = a?.name;
          struturedFiles.push({
            id,
            senderName,
            senderId,
            type,
            name,
            size,
            time,
          });
        });
      });
      return res.json({
        success: true,
        files: struturedFiles,
      });
    } else {
      return res.json({
        msg: "No Files Found",
      });
    }
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

module.exports.messageController = {
  SENDMESSAGE,
  GETMESSAGES,
  GETFILES,
  REPLYMESSAGE,
  GETMESSAGEBYID,
};
