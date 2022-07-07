const express = require("express");
const userModel = require("../models/userModel");
const { hashGenerator } = require("../helpers/Hashing");
const { hashValidator } = require("../helpers/Hashing");
const { JWTtokenGenerator } = require("../helpers/token");
const ActiveSessionModel = require("../models/activeSession");
const { isAuthenticated } = require("../helpers/safeRoutes");
const router = express.Router();
const attorneyModel = require("../models/attorneymodels");
//const sgMail = require('@sendgrid/mail');

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  // console.log(req.body, "req.body");
  if (!password) {
    return res.json({
      msg: "Password Empty",
    });
  }
  userModel.findOne({ email: email }, async (err, isUser) => {
    if (err) {
      return res.json({
        msg: "User Registeration failed",
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
          msg: "Email Already Exist",
        });
      }
    } else {
      console.log("Register");
      const hashPassword = await hashGenerator(password);
      const queryData = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashPassword,
        aflag: true,
      };
      userModel.create(queryData, (err, user) => {
        if (err) {
          return res.json({
            msg: "User Registeration failed",
            error: err,
          });
        } else {
          return res.json({
            success: true,
            msg: "User Registeration successful",
            userID: user._id,
          });
        }
      });
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  userModel.findOne({ email: email }, async (err, isUser) => {
    if (err) {
      return res.json({
        msg: "Login failed",
        error: err,
      });
    } else if (!isUser) {
      return res.json({
        msg: "This email isn't registered yet",
      });
    } else if (!isUser.aflag) {
      return res.json({
        msg: "This account has been deactivated",
      });
    } else {
      const result = await hashValidator(password, isUser.password);
      if (result) {
        console.log(result, "result");
        //sendMail();
        const jwtToken = await JWTtokenGenerator({ user: isUser._id });
        const query = {
          userId: isUser._id,
          username: isUser.firstname + isUser.lastname,
          aflag: true,
          token: "JWT " + jwtToken,
        };
        ActiveSessionModel.create(query, (err, session) => {
          if (err) {
            return res.json({
              msg: "Error Occured!!",
            });
          } else {
            return res.json({
              success: true,
              userID: isUser._id,
              username: isUser.firstname + " " + isUser.lastname,
              token: "JWT " + jwtToken,
            });
          }
        });
      } else {
        return res.json({
          msg: "Password Doesn't match",
        });
      }
    }
  });
});

router.post("/allAttorney", async (req, res) => {
  const { page, limit, searchText } = req.body;
  const skip = (page - 1) * limit;

  attorneyModel.find(
    {
      $or: [
        { firstname: { $regex: "^" + searchText, $options: "i" } },
        { lastname: { $regex: "^" + searchText, $options: "i" } },

        { firm: { $regex: "^" + searchText, $options: "i" } },
      ],
      type: "ATTORNEY",
    },
    null,
    { skip: skip, limit: limit },
    (err, list) => {
      if (err) {
        res.json({
          msg: err,
        });
      } else {
        res.json({
          success: true,
          attorneys: list,
        });
      }
    }
  );
});

router.post("/attorneyCount", async (req, res) => {
  const { searchText } = req.body;

  attorneyModel.countDocuments(
    {
      $or: [
        { firstname: { $regex: "^" + searchText, $options: "i" } },
        { lastname: { $regex: "^" + searchText, $options: "i" } },

        { firm: { $regex: "^" + searchText, $options: "i" } },
      ],
      type: "ATTORNEY",
    },
    (err, count) => {
      if (err) {
        res.json({
          msg: err,
        });
      } else {
        res.json({
          success: true,
          count,
        });
      }
    }
  );
});

// router.get("/attorneys", async (req, res) => {
//   attorneyModel.find({}, null, { limit: 100 }, (err, list) => {
//     if (err) {
//       res.json({
//         msg: err,
//       });
//     } else {
//       res.json({
//         success: true,
//         attorneys: list,
//       });
//     }
//   });
// });

router.put("/edit", async (req, res) => {
  const { email, firstname, lastname } = req.body;
  const queryData = {
    firstname: firstname,
    lastname: lastname,
  };
  userModel.findOneAndUpdate({ email: email }, queryData, (err, user) => {
    if (err) {
      return res.json({
        msg: err,
      });
    } else if (user) {
      userModel.findOne({ email: email }, (err, isUser) => {
        if (err) {
          return res.json({
            msg: "Error Occured",
            error: err,
          });
        } else if (!isUser) {
          return res.json({
            msg: "User not Found",
          });
        } else {
          isUser.password = null;
          isUser.__v = null;
          return res.json({
            success: true,
            user: isUser,
          });
        }
      });
    }
  });
});

router.post("/attorneydetails", async (req, res) => {
  const { objectId } = req.body;
  // console.log("objectId" + objectId);
  attorneyModel.findById(objectId, (err, attorneydetails) => {
    if (err) {
      res.json({
        msg: "Oops Error occurred!",
        error: err,
      });
    } else {
      res.json({
        success: true,
        msg: attorneydetails,
      });
    }
  });
});

router.post("/allUser", async (req, res) => {
  const { userID } = req.body;
  console.log("userid", userID);

  userModel.find(
    { _id: { $ne: userID } },
    null,
    // { sort: { firstname: 1 } },
    (err, list) => {
      if (err) {
        console.log("err", err);

        res.json({
          msg: err,
        });
      } else {
        res.json({
          success: true,
          users: list,
        });
      }
    }
  );
});

// const sendMail=()=>{

 
//   sgMail.setApiKey("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")
  
//   const msg = {
//     to: 'dk18026@gmail.com', // Change to your recipient
//     from: 'dk18026@gmail.com', // Change to your verified sender
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   }
  
//   sgMail
//     .send(msg)
//     .then((response) => {
//       console.log(response[0].statusCode)
//       console.log(response[0].headers)
//     })
//     .catch((error) => {
//       console.error(error)
//     })
// }

module.exports = router;
