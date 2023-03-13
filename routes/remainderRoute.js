const { Router } = require("express");
const Group = require("../models/Group");
const router = Router();
const RemainderModel = require("../models/RemainderModel");

router.get("/", (req, res) => res.send(" Remainder Route"));

router.post("/create", async (req, res) => {
  try {
    const { groupId,messageId,title,date,time,userId } = req.body;
    const isReminderExist = await RemainderModel.findOne({messageId:messageId});
    if(!isReminderExist)  {
      RemainderModel.create(
        ({groupId,userId, messageId,title,date,time}),
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
    }
   else {
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
//     const { currentUserID,currentUserGroupID  } = req.body;

//     RemainderModel.find({"messageId.receivers": currentUserID, "messageId.groupId": currentUserGroupID,})
//       .populate({
//         path: "messageId",
//         select: "caseId groupId sender receivers messageData",
//       })
//       .exec((err, list) => {
//         if (err) {
//           return res.json({
//             msg: err,
//           });
//         } else {
//           return res.json({
//             success: true,
//             reminder: list,
//           });
//         }
//       });
//   } catch (err) {
//     return res.json({ msg: "error" });
//   }
// });

// router.post("/getreminder", async (req, res) => {
//   try {
//     const { currentUserID } = req.body;
//     const reminders =await RemainderModel.find({isActive:true}).populate({
//       path: "groupId",
//       match:{groupMembers: {
//         $elemMatch: {
//           id: currentUserID,
//           isActive: true
//         }
//       }},
//       select: "_id "
//     })
//     .exec();
//       return res.json({ success: true, reminders });
//   } catch (err) {
//     return res.json({ msg: err });
//   }
// });
router.post("/getreminder", async (req, res) => {
  try {
    const { currentUserID } = req.body;
    const reminders =await RemainderModel.find({isActive:true, userId: { $ne: currentUserID }}).populate({
      path: "groupId",
      select: "_id groupMembers"
    }, 
    ) 
    .exec();
    const filteredReminders = reminders.filter(reminder => {
      const groupMembers = reminder.groupId.groupMembers;
      const member = groupMembers.find(member => {
        return member.id.toString() === currentUserID.toString() && member.isActive 
      }  ,
      );
      return member;   
         
    });
    return res.json({ success: true, reminders: filteredReminders,
  
    });
  } catch (err) {
    console.log("err: ",err)
    return res.json({ msg: err });
  }

});
router.post("/getreminderself", async (req, res) => {
  try {
    const { currentUserID } = req.body;
    const reminders =await RemainderModel.find({isActive:true ,userId:currentUserID}).populate({
      path: "groupId",
      select: "_id groupMembers"
    }, 
    ) 
    .exec();
    const filteredReminders = reminders.filter(reminder => {
   
      const groupMembers = reminder.groupId.groupMembers;
      const member = groupMembers.find(member => {
        return member.id.toString() === currentUserID.toString() && member.isActive;
        
      }  
      );
      return member;   
         
    });
    return res.json({ success: true, reminders: filteredReminders,
  
    });
  } catch (err) {
    console.log("err: ",err)
    return res.json({ msg: err });
  }

});





module.exports = router;
