const express = require("express");
const Interval = require("../models/Interval");
const { Router } = require("express");
const router = express.Router();
router.get("/", (req, res) => res.send("interval Route"));

router.post("/eventCreate", async (req, res) => {
    const { caseId, receivedDate, events } = req.body;
    try {
      const eventData = {
        caseId: caseId,
        receivedDate: receivedDate,
        events: events.map((event) => ({
          eventId: event.eventId,
          intervals: event.intervals.map((textObj) => ({
            responseText: textObj.responseText,
            responseDate: textObj.responseDate,
          })),
          receivedDate: event.receivedDate,
          createdAt: new Date(),
          aflag: true,
        })),
      };
  
      const createdEvents = await Interval.create(eventData);
  
      if (createdEvents) {
        return res.json({
          success: true,
          data: createdEvents,
        });
      } else {
        return res.json({
          success: false,
          msg: "Failed to create events",
        });
      }
    } catch (err) {
      console.log("event create error", err);
      return res.json({ msg: err || config.DEFAULT_RES_ERROR });
    }
  });
  
  
  
  module.exports = router;
