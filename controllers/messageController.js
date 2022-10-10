const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");
const moment = require("moment");
const config = require("../config");
const Message = require("../models/Message");
const { sendMail } = require("../services/mail.services");

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
    const { id, sender, msg } = req.body;
    const replyQuery = {
      sender,
      replyMsg: msg,
    };
    const replyMessage = await Message.findByIdAndUpdate(id, {
      $push: { replies: replyQuery },
    });
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
const DELETEMSG = async (req, res) => {
  try {
    const { id, deleteIt, createdAt } = req.body;
    today = new Date();
    time1 = today.valueOf();
    date1 = new Date(createdAt);
    //time2 = new Date().getMinutes();
    time2 = date1.valueOf();
    time3 = time1 - time2;
    if (deleteIt) {
      if (time3 < 60000) {
        const deletedmsg = await Message.findByIdAndUpdate(id, {
          aflag: false,
        });
        if (deletedmsg)
          return res.json({ success: true, deletedmsg, time1, time2, time3 });
      } else {
        return res.json({
          msg: "Unable to Delete later",
        });
      }
    } else {
      return res.json({
        msg: "Unable to Delete",
      });
    }
  } catch (err) {
    console.log("Delete Message error", err);
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
const MAIL_CHAT = async (req, res) => {
  try {
    const { mail, chatRoomId, caseName, groupName } = req.body;
    console.log("chatRoomId : " + chatRoomId);
    const chatMessages = await Message.find({
      groupId:chatRoomId,
    }).populate({
      path: "sender",
      select: "firstname lastname email",
    });
    const doc = new jsPDF();
    const header = [
      ["Sender", "message", "Time", "Group name", "Case name", "Attachments"],
    ];
    let rows = [];
    chatMessages.map((m) => {
      const sender = m?.sender?.firstname + " " + m?.sender?.lastname;
      const message = m?.messageData;
      const time = moment(m?.createdAt).format("DD-MM-YY HH:mm");
      const attachments = m.isAttachment ? m.attachments?.length : "-";
      const tempRow = [sender, message, time, groupName, caseName, attachments];

      rows.push(tempRow);
    });
    doc.autoTable({
      bodyStyles: { valign: "top" },
      margin: {
        top: 30,
      },
      head: header,
      body: rows,
      theme: "grid",
      columnStyles: { 5: { halign: "center" } },
      headStyles: {
        fillColor: [0, 0, 230],
        fontSize: 12,
        fontStyle: "bold",
        font: "courier",
        halign: "center",
      },
      willDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 5 &&
          data.cell.raw !== "-"
        ) {
          data.doc.setFillColor("green");
          data.doc.setTextColor("black");
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text(`${caseName}-${groupName}`, data.settings.margin.left, 20);
      },
    });
    const docName = `${caseName}-${groupName}-${moment(Date.now()).format(
      "DD-MM-YY HH:mm"
    )}`;
    // doc.save(docName)
    const mailOptions = {
      to: mail,
      subject: "Chat Messages",
      html: `<p>Chat Messages for + ${docName}</p>`,
      attachments: [
        {
          filename: `${docName}.pdf`,
          content: doc.output(),
        },
      ],
    };
    const mailSent = await sendMail(mailOptions);
    res.json({ success: true ,mailSent});
  } catch (err) {
    console.log("mailChat err: ", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};
const GETSENDERBYNAMEID = async(req,res) => {
  try{
    const { sender } =req.body;
    const senderName = {
      sender,
      aflag:true,
    }
    const senderDetails =await Message.find(senderName).populate({
      path:"sender",
      select: "firstname lastname",
    });
    if(senderDetails)
    return res.json({
      success:true,
      senderDetails,
    });
  }catch(err) {
    return res.json({msg: err || config.DEFAULT_RES_ERROR})
  }
}
const GETGROUPBYNAMEID=async(req,res) =>{
  try{
    const {caseId}= req.body;
    const groupName = {
      caseId,
      aflag:true,
    }
    const caseDetails = await Message.find(groupName).populate({
      path:"caseId",
      select: "caseName ",
    });
    if(caseDetails)
    return res.json({
      success:true,
      caseDetails,
    });

  }catch(err) {
    return res.json({msg: err || config.DEFAULT_RES_ERROR})
  }
}
module.exports.messageController = {
  SENDMESSAGE,
  GETMESSAGES,
  GETFILES,
  REPLYMESSAGE,
  GETMESSAGEBYID,
  DELETEMSG,
  MAIL_CHAT,
  GETSENDERBYNAMEID,
  GETGROUPBYNAMEID,
};
