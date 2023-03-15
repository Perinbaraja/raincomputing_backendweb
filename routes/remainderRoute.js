const { Router } = require("express");
const Group = require("../models/Group");
const router = Router();
const RemainderModel = require("../models/RemainderModel");

router.get("/", (req, res) => res.send(" Remainder Route"));

router.post("/create", async (req, res) => {
  try {
    const { groupId, messageId, title, userId,date,time,selectedMembers} = req.body;
    const isReminderExist = await RemainderModel.findOne({
      messageId: messageId,
      groupId,
    });
    const struturedMembers = selectedMembers.map((m) => ({ id: m, addedBy: userId }));
    if (!isReminderExist) {
      const remindersQuery={
        groupId,  
        userId,
        messageId,
        title,
        date,
        time,
        selectedMembers:struturedMembers,
      }
      RemainderModel.create(
        remindersQuery,
        (err, reminder) => {
          if (err) {
            return res.json({
              msg: err,
            });
          } else {
            return res.json({
              success: true,
              reminder,
            });
          }
        }
      );
    } else {
      return res.json({
        msg: "Already Reminder Exist",
      });
    }
  } catch (err) {
    return res.json({ msg: err?.name || err });
  }
});

router.post("/getreminder", async (req, res) => {
  try {
    const { currentUserID } = req.body;
    const reminders = await RemainderModel.find({
      isActive: true,
      userId: { $ne: currentUserID },
      selectedMembers: { $elemMatch: { id: currentUserID } }

    })
      .populate({
        path:"messageId",
        select:"_id messageData"
      })
      .exec();
    return res.json({ success: true, reminders});
  } catch (err) {
    console.log("err: ", err);
    return res.json({ msg: err });
  }
});

router.post("/getreminderself", async (req, res) => {
  try {
    const { currentUserID } = req.body;
    const reminders = await RemainderModel.find({
      isActive: true,
      userId: currentUserID,
    })
      .populate({
        path: "groupId",
        select: "_id groupMembers",
      })
      .exec();
    const filteredReminders = reminders.filter((reminder) => {
      const groupMembers = reminder.groupId.groupMembers;
      const member = groupMembers.find((member) => {
        return (
          member.id.toString() === currentUserID.toString() && member.isActive
        );
      });
      return member;
    });
    return res.json({ success: true, reminders: filteredReminders });
  } catch (err) {
    console.log("err: ", err);
    return res.json({ msg: err });
  }
});

router.put("/removeReminder", async (req, res) => {
  const { reminderId } = req.body;
  const removeReminder = await RemainderModel.findOneAndDelete({
    _id: reminderId,
  });

  if (!removeReminder) {
    res.status(404);
  } else {
    res.json({ success: true, removeReminder });
  }
  
});

module.exports = router;
