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
      title,
      userId,
      scheduledTime,
      selectedMembers,
    } = req.body;

    const isReminderExist = await RemainderModel.findOne({
      messageId: messageId,
      groupId,
    });

    const struturedMembers = selectedMembers.map((m) => ({
      id: m,
      addedBy: userId,
    }));

    if (!isReminderExist) {
      const remindersQuery = {
        groupId,
        userId,
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
    } else {
      return res.json({
        msg: "Already Reminder Exist",
      });
    }
  } catch (err) {
    return res.json({ msg: err?.name || err });
  }
});

// router.post("/getreminder", async (req, res) => {
//   try {
//     const { currentUserID } = req.body;
//     const reminders = await RemainderModel.find({
//       isActive: true,
//       userId: { $ne: currentUserID },
//       selectedMembers: { $elemMatch: { id: currentUserID } }
//     })
//       .populate({
//         path:"messageId",
//         select:"_id messageData"
//       })
//       .exec();
//       console.log("reminders",reminders);
//     // Loop through each reminder for selected member and schedule a reminder notification
//     reminders.forEach((reminder) => {
//   //     const dateStr = moment(reminder.scheduledTime, 'YYYY-MM-DD').format('YYYY-MM-DD');
//   // const timeStr = moment(reminder.scheduledTime, 'HH:mm:ss').format('HH:mm:ss');
//       // const dateStr = moment(reminder.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
//       // const timeStr = moment(reminder.time, 'HH:mm').format('HH:mm');
//       const scheduledTime = reminder?.scheduledTime;
// console.log('scheduledTime:', scheduledTime);
// const notificationTime = moment(scheduledTime, moment.ISO_8601).toDate();
// console.log('notificationTime:', notificationTime);
//       // const notificationTime = moment(`${reminder?.scheduledTime}`, moment.ISO_8601).toDate();
//       // ... rest of the code

//     // Combine the date and time fields to create the notification time using Moment.js
//       // Schedule the reminder notification for the user's notification time
//       schedule.scheduleJob(notificationTime, () => {
//         console.log(`Reminder for ${reminder.title} at ${notificationTime}`);
//         // TODO: Send the notification to the user
//         const notificationData = {
//           title: `Reminder: ${reminder.title}`,
//           message: reminder.messageId.messageData, // Use the message data from the populated field
//           recipient: currentUserID

//         };

//         console.log("noti",notificationData)
//       });
//     });
//     return res.json({ success: true, reminders });
//   } catch (err) {
//     console.log("err: ", err);
//     return res.json({ msg: err });
//   }
// });
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
      console.log("scheduledTime:", scheduledTime);
      const notificationTime = scheduledTime.toDate();
      console.log("notificationTime:", notificationTime);
      // Schedule the reminder notification for the user's notification time
      schedule.scheduleJob(notificationTime, () => {
        const localTime = scheduledTime.clone().tz(moment.tz.guess()); // Convert the scheduled time to the local time zone of the user
        const formattedTime = localTime.format("h:mm a"); // Format the time as "5:15 pm"
        console.log(`Reminder for ${reminder.title} at ${formattedTime}`);
        // TODO: Send the notification to the user
        const notificationData = {
          title: `Reminder: ${reminder.title}`,
          message: reminder.messageId.messageData, // Use the message data from the populated field
          recipient: currentUserID,
        };

        console.log(`Notification scheduled for ${formattedTime} with data:`, notificationData);
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

    console.log("responseData", responseData);
    return res.json(responseData);
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
