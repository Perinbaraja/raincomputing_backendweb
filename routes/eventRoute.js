const express = require("express");
const Eventmodel = require("../models/Eventmodel");
const router = express.Router();
router.get("/", (req, res) => res.send("event Route"));
router.post("/create", async (req, res) => {
    const { name } = req.body;
    Eventmodel.create({ name }, async (err, event) => {
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
  router.get("/getAllStatus", async (req, res) => {
    Eventmodel.find({},(err,data) =>{
        if(err) {
            return res.json({
                msg: "Oops Error occurred!",
                error: err,
            })
        }else {
            return res.json({
                success: true,
                data
            })
        }
    } )
  })
  module.exports = router;