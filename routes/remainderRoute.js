const { Router } = require("express");
const Group = require("../models/Group");
const router = Router();
const RemainderModel = require("../models/RemainderModel");
const moment = require("moment-timezone");
const schedule = require("node-schedule");
const io = require("socket.io");
const { sendMail } = require("../services/mail.services");
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

router.post("/getAllReminders", async (req, res) => {
  try {
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
        path: "selectedMembers.id selectedMembers.addedBy",
        select: "_id firstname lastname email",
      })

      .exec((err, getReminders) => {
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
  } catch {
    return res.json({ msg: err });
  }
});

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
      .populate({
        path: "selectedMembers.id",
        select: "_id firstname lastname email",
      })
      .exec();
    // Schedule the reminders
    const scheduledReminders = [];
    const now = new Date().getTime();
    reminders.forEach((reminder) => {
      const scheduledTime = moment.tz(reminder.scheduledTime, "Asia/Kolkata");
      const notificationTime = scheduledTime
        .clone()
        .subtract(5, "hours")
        .subtract(30, "minutes")
        .toDate();
      // Check for duplicates
      if (scheduledReminders.some((r) => r.id === reminder._id)) {
        console.log(`Reminder "${reminder.title}" already scheduled.`);
        return;
      }
      // Schedule the notification to show when the notification time is reached
      const timeDiff = notificationTime.getTime() - now;
      if (timeDiff > 0) {
        // Set a timeout for the notification to be received
        const timeoutId = setTimeout(() => {
          // Send the reminder to selected members
          const selectedMembers = reminder.selectedMembers.map(
            (member) => member.id.email
          );
          const mailOptions = {
            to: selectedMembers,
            subject: `Reminder Message: ${reminder.title}`,
            html: `<div><h3>Hello, This is a Reminder Message from Rain Computing</h3>
            <p>Your reminder Time is at ${notificationTime}:</p>
            <p>Title: ${reminder.title}</p>
            <p>Message: ${reminder.messageId.messageData}</p>
            <a href="http://raincomputing.net">View Reminder</a></div>`,
          };
          sendMail(mailOptions)
            .then(() => {
              console.log("Reminder sent successfully");
            })
            .catch((error) => {
              console.error("Error sending reminder:", error);
            });
          // Remove the scheduled reminder from the list
          scheduledReminders.splice(
            scheduledReminders.findIndex((r) => r.id === reminder._id),
            1
          );
        }, timeDiff);
        // Add the scheduled reminder to the list
        scheduledReminders.push({ id: reminder._id, timeoutId: timeoutId });
      } else {
        console.log(
          `Reminder notification time for "${reminder.title}" has already passed.`
        );
      }
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
    let responseData = { success: true, reminders: reminders };
    if (nextReminder) {
      const nextScheduledTime = moment.tz(
        nextReminder.scheduledTime,
        "Asia/Kolkata"
      );
      const formattedNextScheduledTime = nextScheduledTime
        .clone()
        .tz(moment.tz.guess())
        .format("h:mm a");
      responseData.nextNotificationTime = formattedNextScheduledTime;
      responseData.nextReminder = nextReminder;
    } else {
      // If there is no reminder scheduled, return an empty response
      responseData.nextNotificationTime = null;
      responseData.nextReminder = null;
    }
    // Send the response
    res.json(responseData);
  } catch (err) {
    console.error("Error getting reminders:", err);
    res.json({ success: false, msg: err.message });
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
