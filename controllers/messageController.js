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
    let messageQuery = {
      groupId,
      sender,
      receivers,
      messageData,
    };
    if (caseId) {
      messageQuery.caseId = caseId;
    }
    if (isAttachment) {
      (messageQuery.isAttachment = true),
        (messageQuery.attachments = attachments);
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

module.exports.messageController = {
  SENDMESSAGE,
  GETMESSAGES,
};
