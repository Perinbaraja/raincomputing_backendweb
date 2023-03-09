const { Router } = require("express");
const router = Router();
const RemainderModel = require("../models/RemainderModel");

router.get("/", (req, res) => res.send(" Remainder Route"));

router.post("/create", async (req, res) => {
  try {
    const { messageId,title,date,time } = req.body;
    const isReminderExist = await RemainderModel.findOne({ messageId});
    if(!isReminderExist)  {
      RemainderModel.create(
        { messageId,title,date,time},
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
router.post("/getreminder", async (req, res) => {
  try {
    const { messageId } = req.body;
    RemainderModel.find({ messageId })
      .populate({
        path: "messageId",
        select: "caseId groupId sender receivers messageData",
      })
      .exec((err, list) => {
        if (err) {
          return res.json({
            msg: err,
          });
        } else {
          return res.json({
            success: true,
            reminder: list,
          });
        }
      });
  } catch (err) {
    return res.json({ msg: "error" });
  }
});
module.exports = router;
