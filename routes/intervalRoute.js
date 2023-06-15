const express = require("express");
const Interval = require("../models/Interval");
const { Router } = require("express");
const router = express.Router();
router.get("/", (req, res) => res.send("interval Route"));

router.post("/eventCreate", async (req, res) => {
    const { caseId, receivedDate, events,responseTexts } = req.body;
    try {
      const eventData = {
        caseId: caseId,
        receivedDate: receivedDate,
        events: events.map((event) => ({
          eventId: event.eventId,
          eventName: event.eventName,
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
  router.get("/getAllResponseTexts", async (req, res) => {
    Interval.find({}, (err, events) => {
      if (err) {
        return res.json({
          msg: "err",
        });
      } else {
        // Extract all responseTexts from events and flatten them into a single array
        const responseTexts = [...events.flatMap(event => event.responseTexts)];
        return res.json({
          success: true,
          responseTexts,
        });
      }
    });
  });
  
  router.post("/getIntervalData", async (req, res) => {
    const { eventId } = req.body;
    const allIntervals = await Interval.find({});
    const events = allIntervals.flatMap((interval) => interval.events);
    const Eventdata = events.filter(event => event.eventId == eventId);
  if(Eventdata) {
    return res.json({
        success: true,
        Eventdata
    })
  }else{
    return res.json({
        msg:"Not found"
    })
  }
  });

  router.post("/getCaseIdByEvents", async (req,res) => {
    const {caseId} = req.body;
    Interval.find({caseId : caseId} , (err, caseEvents) => {
      if (err) {
        return res.json({
          msg:"Not found",
        })
      }else {
        return res.json({
          success: true,
          caseEvents
        })
      }
    })
  })
  module.exports = router;
