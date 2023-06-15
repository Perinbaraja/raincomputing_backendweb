const express = require("express");
const Eventmodel = require("../models/Eventmodel");
const router = express.Router();
router.get("/", (req, res) => res.send("event Route"));
router.post("/create", async (req, res) => {
  const { eventName, description, interval, firmId,responseText } = req.body;
  const eventData = {
    eventName: eventName,
    description: description,
    interval: interval,
    firmId: firmId,
    responseText: responseText,
    aflag: true,
  };
  Eventmodel.create(eventData, async (err, event) => {
    if (err) {
      return res.json({
        msg: "pls select event ",
        error: err,
      });
    } else {
      return res.json({
        success: true,
        msg: " event added",
        event,
      });
    }
  });
});
router.post("/eventUpdate", async (req, res) => {
  try {
    const { eventId, description, interval,responseText } = req.body;
    const updateEvent = {
      description: description,
      interval: interval,
      responseText:responseText
    };
    const updateEventData = await Eventmodel.findOneAndUpdate(
      { _id: eventId },
      updateEvent,
      { new: true }
    );
    return res.json({
      success: true,
      updateEventData,
    });
  } catch (err) {
    return res.json({
      msg: err,
    });
  }
});

router.post("/getAllCaseEvent", async (req, res) => {
  const { id } = req.body;
  Eventmodel.find({ firmId: id }, (err, data) => {
    if (err) {
      return res.json({
        msg: "Oops Error occurred!",
        error: err,
      });
    } else {
      return res.json({
        success: true,
        data,
      });
    }
  });
});
router.post("/getEventdata", async (req,res) => {
  const { Id } = req.body;
   Eventmodel.find({_id: Id} ,(err, event) => {
    if(err) {
      return res.json({
        msg:"not found event"
      })
    }else {
      return res.json({
        success: true,
         event
      })
    }
  })
})


module.exports = router;
