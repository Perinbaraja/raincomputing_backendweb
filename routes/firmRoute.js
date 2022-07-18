const express = require("express");
const RegAttorneyModel = require("../models/RegAttorneyModel");
const FirmModel = require("../models/FirmModel");
const router = express.Router();

router.get("/", (req, res) => res.send(" Firm Route"));

router.post("/register", async (req, res) => {
  try {
    const { attorneyId, firmName, members } = req.body;
    const isFirmExist = await FirmModel.findOne({ attorneyId });
    if (isFirmExist) {
      return res.json({
        msg: `You already have firm ${isFirmExist._id}`,
      });
    } else {
      FirmModel.create({ attorneyId, firmName, members, aflag: true,}, (err, firm) => {
        if (err) {
          return res.json({
            msg: err,
          });
        } else {
          return res.json({
            success: true,
            firm,
          });
        }
      });
    }
  } catch (err) {
    return res.json({
      msg: err,
    });
  }
});

router.post("/getFirmByAttorneyId", async (req, res) => {
  const { attorneyId } = req.body;
  FirmModel.find({ members: attorneyId }, async (err, firms) => {
    if (err) {
      return res.json({
        msg: err,
      });
    } else {
      return res.json({
        success: true,
        firms,
      });
    }
  });
});

router.post("/getFirmById", async (req, res) => {
  try{
    const {firmId } = req.body

   FirmModel.findOne({_id:firmId, aflag: true})
  .populate({
    path: "members",
    populate: { path: 'regUser',
  select: "firstname lastname email", }
  })
  .exec((err, firm) => {
    if (err) {
      return res.json({
        msg: err,
      });
    } else if (firm) {
      return res.json({
        success: true,
        firm,
      });
    }
    else{
      return res.json({
        msg:`No firm found with id ${firmId}`
      })
    }
  });

  }
  catch(err){
    return res.json({
      msg:err
    })
  }
 
});



module.exports = router;
