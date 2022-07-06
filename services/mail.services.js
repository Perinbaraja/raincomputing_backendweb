require("dotenv").config();
const nodemailer = require("nodemailer");
const config = require("../config");
const sendMail = async (mailOptions) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: config.MAIL_SERVICE,
      auth: {
        user: config.SENDER_MAIL,
        pass: config.MAIL_PASSWORD,
      },
    });

    // const mailOptions = {
    //   to: receiverMail,
    //   subject: "mail from node",
    //   text: token,
    // };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        resolve(false);
      } else {
        // resolve(info.response);
        resolve(true);
      }
    });
  });
};

module.exports = {
  sendMail,
};
