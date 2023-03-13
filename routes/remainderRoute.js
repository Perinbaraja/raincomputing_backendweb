const { Router } = require("express");
const Group = require("../models/Group");
const router = Router();
const RemainderModel = require("../models/RemainderModel");

router.get("/", (req, res) => res.send(" Remainder Route"));

router.post("/create", async (req, res) => {
  try {
    const { groupId,messageId,title,date,time } = req.body;
    const isReminderExist = await RemainderModel.findOne({messageId:messageId});
    if(!isReminderExist)  {
      RemainderModel.create(
        ({groupId, messageId,title,date,time}),
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
    const reminders =await RemainderModel.find({isActive:true}).populate({
      path: "groupId",
      // match:{groupMembers: {
      //   $elemMatch: {
      //     id: currentUserID,
      //     isActive: true
      //   }
      // }},
      select: "_id groupMembers"
    }, 
    ) 
    .exec();
    // console.log("")
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

// router.post("/getreminder", async (req, res) => {
//   try {
//     const { currentUserID } = req.body;

//     const groups = await Group.find({
//       groupMembers: {
//         $elemMatch: {
//           id: currentUserID,
//           isActive: true
//         }
//       }
//     }, "_id");
    

//     const currentUserGroupIDs = groups.map(group => group?._id);

//     const reminders = await RemainderModel.find({
//       "messageId.groupId": { $in: currentUserGroupIDs },
//       "messageId.receivers": currentUserID
//     })
    
//     .populate({
//       path: "messageId",
//       select: "caseId groupId sender receivers messageData"
//     })
//     .exec();    
//     console.log("currentUserGroupIDs:", {$in: currentUserGroupIDs})

 
//     return res.json({
//       success: true,
//       reminder: reminders
//     })
    

//   } catch (err) {
//     return res.json({ msg: "error" });
//   }
// });






module.exports = router;
