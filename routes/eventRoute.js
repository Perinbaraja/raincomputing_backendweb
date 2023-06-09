const express = require("express");
const Eventmodel = require("../models/Eventmodel");
const router = express.Router();
router.get("/", (req, res) => res.send("event Route"));
router.post("/create", async (req, res) => {
  const { eventName, description, interval, firmId } = req.body;
  const eventData = {
    eventName: eventName,
    description: description,
    interval: interval,
    firmId: firmId,
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
router.put("/eventMasterEdit", async (req, res) => {
  try {
    const { eventId, eventName, description, interval } = req.body;
    const updateEvent = {
      eventName: eventName,
      description: description,
      interval: interval,
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

router.get("/getAllEvent", async (req, res) => {
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
module.exports = router;
