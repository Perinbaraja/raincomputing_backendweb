const express = require("express");

const router = require("./userRoute");
const UserModel = require("../models/userModel");
const AppointmentModel = require("../models/AppointmentModel");

router.get("/", (req, res) => res.send(" Attorney Route"));

router.post("/appointmentrequest", async (req, res) => {
  try {
    const { User, attorney, caseData, status } = req.body;
    const user = await UserModel.findOne({ _id: User, aflag: true });
    if (user) {
      const appointmentReqQuery = {
        User: user,
        attorney: attorney,
        caseData,
        status,
      };
      const isAlreadyReqAppointment = await AppointmentModel.find({
        attorney,
        User,
      });
      if (isAlreadyReqAppointment.length > 0) {
        return res.json({
          msg: `you have already send appointment reqest to ${attorney}`,
        });
      } else {
        const appointmentRequest = await AppointmentModel.create(
          appointmentReqQuery
        );

        if (appointmentRequest) {
          console.log("object", appointmentRequest);
          const updatedUser = await UserModel.findByIdAndUpdate(User, {
            appointmentStatus: status,

            lastModified: Date.now(),
          });
          if (updatedUser) {
            console.log("update", updatedUser);
            return res.json({
              success: true,
              userID: updatedUser._id,
              firstname: updatedUser.firstname,
              lastname: updatedUser.lastname,
              email: updatedUser.email,
              appointmentStatus: status,
            });
          } else {
            return res.json({
              msg: "Appointment reqest send successfully ",
            });
          }
        } else {
          return res.json({ msg: "Appointment reqest failed" });
        }
      }
    } else {
      return res.json({ msg: "User not found" });
    }
  } catch (err) {
    return res.json({
      msg: err?.name || err,
    });
  }
});

router.post("/getAllAppointmentRequestByUserId", async (req, res) => {
  try {
    const { userID } = req.body;
    AppointmentModel.find({ attorney: userID, status: "request" })
      .populate({
        path: "User",
        select: "firstname lastname email casedata attachments status attorney",
      })
      .exec((err, isAppointment) => {
        if (err) {
          return res.json({
            msg: err,
          });
        } else {
          return res.json({
            success: true,
            appointment: isAppointment,
          });
        }
      });
  } catch (err) {
    return res.json({ msg: "error" });
  }
});

router.put("/appointmentStatus", async (req, res) => {
  try {
    const { appointmentID, status } = req.body;
    const updatedApponitment = await AppointmentModel.findByIdAndUpdate(
      appointmentID,
      {
        status: status,
        lastModified: Date.now(),
      }
    );

    if (updatedApponitment) {
      res.json({
        success: true,
        status: "success",
      });
    }
  } catch (err) {
    console.log("att err:", err);
    return res.json({
      msg: err,
    });
  }
});
module.exports = router;
