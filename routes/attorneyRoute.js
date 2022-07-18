const express = require("express");
const RegAttorneyModel = require("../models/RegAttorneyModel");
const UserModel = require("../models/userModel");
const router = express.Router();

router.get("/", (req, res) => res.send(" Attorney Route"));

router.post("/register", async (req, res) => {
  try {
    //De-Struturing values from request body
    const { userID, barNumber, phoneNumber, address, status } = req.body;
    //Finding user from DB collection using unique userID
    const user = await UserModel.findOne({ _id: userID, aflag: true });
    //Executes is user found
    if (user) {
      //Creating query to registering user
      const regAttorneyQuery = {
        regUser: userID,
        barNumber: barNumber,
        phoneNumber,
        address,
        status,
      };
      const isAlreadyRegistered = await RegAttorneyModel.find({
        barNumber,
      });
      if (isAlreadyRegistered.length > 0) {
        return res.json({ msg: `${barNumber} already exist` });
      } else {
        const regAttorney = await RegAttorneyModel.create(regAttorneyQuery);
        if (regAttorney) {
          const updatedUser = await UserModel.findByIdAndUpdate(userID, {
            attorneyStatus: status,
            lastModified: Date.now(),
          });
          if (updatedUser) {
            return res.json({
              success: true,
              userID: updatedUser._id,
              firstname: updatedUser.firstname,
              lastname: updatedUser.lastname,
              email: updatedUser.email,
              attorneyStatus: status,
            });
          } else {
            return res.json({
              msg: "Registeration request recived, Failed to update user status",
            });
          }
        } else {
          return res.json({ msg: "Attorney Registeration failed" });
        }
      }
    } else {
      return res.json({ msg: "User not found" });
    }
  } catch (err) {
    return res.json({ msg: err?.name || err });
  }
});

router.post("/getByUserId", async (req, res) => {
  try {
    const { userID } = req.body;
    RegAttorneyModel.findOne({ regUser: userID })
      .populate({
        path: "regUser",
        select: "firstname lastname email",
      })
      .exec((err, isAttorney) => {
        if (err) {
          return res.json({
            msg: err,
          });
        } else {
          return res.json({
            success: true,
            attorney: isAttorney,
          });
        }
      });
  } catch (err) {
    return res.json({ msg: err });
  }
});

router.post("/getAllAttorney",async (req,res) =>{
  const {attorneyID} = req.body;
  RegAttorneyModel.find({ _id: { $ne: attorneyID },status: "approved" }).populate({
    path: "regUser",
    select: "firstname lastname email",
  }) .exec((err, attorneys) => {
    if (err) {
      return res.json({
        msg: err,
      });
    } else {
      return res.json({
        success: true,
        attorneys,
      });
    }
  });
})

router.post("/regAttorneyDetails", async (req, res) => {
  const { objectId } = req.body;
  // console.log("objectId" + objectId);
  RegAttorneyModel.findById(objectId, (err, regAttorneydetails) => {
    if (err) {
      res.json({
        msg: "Oops Error occurred!",
        error: err,
      });
    } else {
      res.json({
        success: true,
        attorney: regAttorneydetails,
      });
    }
  });
});

module.exports = router;
