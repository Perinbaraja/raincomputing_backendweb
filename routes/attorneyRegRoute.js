const express = require("express");
const AttorneyRegModel = require("../models/AttorneyRegModel");
const router = express.Router();

router.post("/register", async (req, res) => {
    const { attorney,attorneybarnumber, baradmitdate, phonenumber, email, address, } = req.body;
    // console.log(req.body, "req.body");

    AttorneyRegModel.findOne({ attorneybarnumber: attorneybarnumber }, async (err, isUser) => {
        if (err) {
            return res.json({
                msg: "Attorney Registeration failed",
                error: err,
            });
        } else if (isUser) {
            if (!isUser.aflag) {
                return res.json({
                    msg: "This account has been deactivated",
                });
            } else {
                console.log("Alre");

                return res.json({
                    msg: "Attorney Already Registered",
                });
            }
        } else {
            console.log("Register");
            const queryData = {
                attorney:attorney,
                attorneybarnumber: attorneybarnumber,
                baradmitdate: baradmitdate,
                phonenumber: phonenumber,
                email: email,
                address: address,
                aflag: true,
            };
            AttorneyRegModel.create(queryData, (err, user) => {
                if (err) {
                    return res.json({
                        msg: "Attorney Registeration failed",
                        error: err,
                    });
                } else {
                    return res.json({
                        success: true,
                        msg: "Attorney Registeration successful",
                        userID: user._id,
                    });
                }
            });
        }
    });
});


module.exports = router;
