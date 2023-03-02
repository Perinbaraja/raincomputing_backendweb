const express = require("express");
const RegAttorneyModel = require("../models/RegAttorneyModel");
const UserModel = require("../models/userModel");
const { sendMail } = require("../services/mail.services");
const router = express.Router();

router.get("/", (req, res) => res.send(" Attorney Route"));

router.post("/register", async (req, res) => {
  try {
    //De-Struturing values from request body
    const {
      userID,
      registerNumber,
      phoneNumber,
      firm,
      bio,
      address,
      country,
      state,
      city,
      postalCode,
      status,
    } = req.body;
    //Finding user from DB collection using unique userID
    const user = await UserModel.findOne({ _id: userID, aflag: true });
    //Executes is user found
    if (user) {
      //Creating query to registering user
      const regAttorneyQuery = {
        regUser: userID,
        registerNumber: registerNumber,
        phoneNumber,
        firm,
        bio,
        address,
        country,
        state,
        city,
        postalCode,
        status,
        aflag: true,
      };
      const isAlreadyRegistered = await RegAttorneyModel.find({
        registerNumber,
      });
      if (isAlreadyRegistered.length > 0) {
        return res.json({ msg: `${registerNumber} already exist` });
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
              profilePic: updatedUser.profilePic,
              aflag: true,
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
        select: "firstname lastname email profilePic",
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

router.post("/getAllAttorney", async (req, res) => {
  const { attorneyID } = req.body;
  RegAttorneyModel.find({ _id: { $ne: attorneyID }, status: "approved" })
    .populate({
      path: "regUser",
      select: "firstname lastname email profilePic",
    })
    .exec((err, attorneys) => {
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
});

router.post("/regAttorneyDetails", async (req, res) => {

  const { id } = req.body;
  RegAttorneyModel.findById({ _id: id })
    .populate({
      path: "regUser",
      select: "firstname lastname email profilePic",
    })
    .exec((err, regAttorneydetails) => {
      if (err) {
        return res.json({
          msg: err,
        });
      } else {
        return res.json({
          success: true,
          attorney: regAttorneydetails,
        });
      }
    });
});

router.post("/inviteAttorney", async (req, res) => {
  const mailOptions = {
    to: "dk18026@gmail.com",
    subject: "Invitation In Rain Computing",
    html: `<div><h3> Hello ,This Is Rain Computing Invite Message</h3>
    <a href="http://raincomputing.net/login">View Message</a></div>`,
  };
  const mailSent = await sendMail(mailOptions);
  res.json({ success: true, mailSent });
});
module.exports = router;
