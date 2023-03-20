const { Router } = require("express");
const Group = require("../models/Group");
const router = Router();
const RemainderModel = require("../models/RemainderModel");
const moment = require("moment-timezone");
const schedule = require("node-schedule");
const io = require("socket.io");
router.get("/", (req, res) => res.send(" Remainder Route"));

router.post("/create", async (req, res) => {
  try {
    const {
      groupId,
      messageId,
      caseId,
      title,
      userId,
      scheduledTime,
      selectedMembers,
    } = req.body;

    const struturedMembers = selectedMembers.map((m) => ({
      id: m,
      addedBy: userId,
    }));

      const remindersQuery = {
        groupId,
        userId,
        caseId,
        messageId,
        title,
        scheduledTime, // Use scheduledTime instead of date and time
        selectedMembers: struturedMembers,
      };

      RemainderModel.create(remindersQuery, (err, reminder) => {
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
      });
    
    
  } catch (err) {
    return res.json({ msg: err?.name || err });
  }
});



router.post ("/getAllReminders",async (req,res)=>{
  try{
    const { currentUserID } = req.body;
  RemainderModel.find({
      isActive: true,
      userId: { $ne: currentUserID },
      selectedMembers: { $elemMatch: { id: currentUserID } },
    })
      .populate({
        path: "messageId",
        select: "_id messageData",
      })
      .populate({
        path: 'selectedMembers.id selectedMembers.addedBy',
      select: '_id firstname lastname email'
      })

      .exec((err,getReminders)=>{

        if (err) {
          return res.json({
            msg: err,
          });
        } else {
          return res.json({
            success: true,
            reminders: getReminders,
          });
        }
      });
  }catch{
    return res.json({ msg: err });

  }
})
router.post("/getreminder", async (req, res) => {
  try {
    const { currentUserID } = req.body;
    const reminders = await RemainderModel.find({
      isActive: true,
      userId: { $ne: currentUserID },
      selectedMembers: { $elemMatch: { id: currentUserID } },
    })
      .populate({
        path: "messageId",
        select: "_id messageData",
      })
      .exec();
      

    // Loop through each reminder for selected member and schedule a reminder notification
    reminders.forEach((reminder) => {
      const scheduledTime = moment.tz(reminder.scheduledTime, "Asia/Kolkata"); // Set the time zone of the scheduled time
      const notificationTime = scheduledTime.toDate();
      schedule.scheduleJob(notificationTime, () => {
        const localTime = scheduledTime.clone().tz(moment.tz.guess()); // Convert the scheduled time to the local time zone of the user
        const formattedTime = localTime.format("h:mm a"); // Format the time as "5:15 pm"
        // TODO: Send the notification to the user
        const notificationData = {
          title: `Reminder: ${reminder.title}`,
          message: reminder.messageId.messageData, // Use the message data from the populated field
          recipient: currentUserID,
        };

        // console.log(`Notification scheduled for ${formattedTime} with data:`, notificationData);
      });
    });

    // Find the earliest reminder in the list
    const nextReminder = reminders.reduce((acc, curr) => {
      if (!acc) {
        return curr;
      } else {
        const accScheduledTime = moment.tz(acc.scheduledTime, "Asia/Kolkata");
        const currScheduledTime = moment.tz(curr.scheduledTime, "Asia/Kolkata");
        if (currScheduledTime.isBefore(accScheduledTime)) {
          return curr;
        } else {
          return acc;
        }
      }
    }, null);

    // If there is a reminder scheduled, create a response data object with the reminder and formatted time for the next notification
    let responseData = { success: true, reminders };
    if (nextReminder) {
      const nextScheduledTime = moment.tz(nextReminder.scheduledTime, "Asia/Kolkata");
      const formattedNextScheduledTime = nextScheduledTime.clone().tz(moment.tz.guess()).format("h:mm a");
      responseData.nextNotificationTime = formattedNextScheduledTime;
      responseData.nextReminder = nextReminder;
    }

    // console.log("responseData", responseData);
    return res.json(responseData);
  } catch (err) {
    // console.log("err: ", err);
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
    // console.log("err: ", err);
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
