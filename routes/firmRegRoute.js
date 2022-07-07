const express = require("express");
const FirmRegModel = require("../models/FirmRegModel");
const router = express.Router();

router.post("/firmcreate", async (req, res) => {
    const { attorney, firmname, firmaddress, llcno, category, firmid } = req.body;
    // console.log(req.body, "req.body");

    FirmRegModel.findOne({ firmname: firmname }, async (err, success) => {
        if (err) {
            return res.json({
                msg: "Firm Registeration failed",
                error: err,
            });
        } 
        else if (success) {
            if (success.aflag) {
                return res.json({
                    msg: "This Firm Registered Successfully",
                });
            } 
            else {
                console.log("Alre");
                return res.json({
                    msg: "Firm Already Registered",
                });
            }
        } else {
            console.log("CreateFirm");
            const queryData = {
                attorney:attorney,
                firmname: firmname,
                firmaddress: firmaddress,
                llcno: llcno,
                category: category,
                firmid: firmid,
            };
            FirmRegModel.create(queryData, (err, user) => {
                if (err) {
                    return res.json({
                        msg: "Firm Registeration failed",
                        error: err,
                    });
                } else {
                    return res.json({
                        success: true,
                        msg: "Firm Registeration successful",
                        userID: user._id,
                    });
                }
            });
        }
    });
});


module.exports = router;
