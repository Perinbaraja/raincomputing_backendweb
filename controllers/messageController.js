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
    } = req.body;
    const messageQuery = {
      groupId,
      sender,
      receivers,
      messageData,
      isAttachment,
      attachments,
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
          const typeIndex = a?.type.indexOf("/");
          const type = a?.type.slice(typeIndex !== 0 ? typeIndex + 1 : 0);
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
};
