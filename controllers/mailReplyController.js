const axios = require("axios");
const { google } = require("googleapis");
const config = require("../config");
require("dotenv").config();

const Group = require("../models/Group");

const Message = require("../models/Message");

const oAuth2Client = new google.auth.OAuth2(
  config.MAIL_CLIENT_ID,
  config.MAIL_CLIENT_SECRET,
  config.MAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: config.MAIL_REFRESH_TOKEN,
});

const generateConfig = (url, accessToken) => {
  return {
    method: "get",
    url: url,
    headers: {
      Authorization: `Bearer ${accessToken} `,
      // "Content-type": "application/json"
    },
  };
};

async function getUser(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/profile`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getDrafts(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/drafts`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error?.name);
    console.log(error?.response?.data?.error?.errors);
    console.log(error?.response?.status);
    // console.log(error?.response?.headers);
    // return error;
    res.send(error);
  }
}

async function searchMail(req, res) {
  try {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${req.params.search}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    if (response?.data?.messages?.length > 0) {
      // Promise.all().then()
      const readMailURL = `https://gmail.googleapis.com//gmail/v1/users/me/messages/${response?.data?.messages[0]?.id}`;
      const readMailConfig = generateConfig(readMailURL, token);
      const readMailResponse = await axios(readMailConfig);
      const messsageData = readMailResponse.data;
      const { payload } = messsageData;
      let validMessageData = "";
      let validAttachments = [];
      let parts = [payload];
      while (parts.length) {
        let part = parts.shift();
        if (part.parts) {
          parts = parts.concat(part.parts);
        }

        if (part.mimeType === "text/plain" && validMessageData === "") {
          validMessageData = decodeURIComponent(
            escape(atob(part.body.data.replace(/\-/g, "+").replace(/\_/g, "/")))
          );
        }
        // if (part.mimeType === "application/pdf") {
        //   const attachmentURL = `https://gmail.googleapis.com//gmail/v1/users/me/messages/${response?.data?.messages[0]?.id}/attachments/${part?.body?.attachmentId}`;
        //   const attachmentConfig = generateConfig(attachmentURL, token);
        //   const attachmentResponse = await axios(attachmentConfig);
        //   console.log(
        //     "attachmentResponse : " + JSON.stringify(attachmentResponse?.data)
        //   );
        //   validMessageData = attachmentResponse?.data?.data;
        // }
      }
      const groupId = payload?.headers
        .find((h) => h?.name === "Subject")
        ?.value.split("__")[1];
      const senderEmail = payload?.headers
        .find((h) => h?.name === "From")
        ?.value?.match(/[^@<\s]+@[^@\s>]+/)[0];
      const group = await Group.findById(groupId).populate({
        path: "groupMembers.id",
        select: "email",
      });
      if (group) {
        const sender = group?.groupMembers?.find(
          (g) => g?.id?.email === senderEmail
        )?.id?._id;
        const receivers = group?.groupMembers
          ?.filter((gm) => gm?.id?.email !== senderEmail)
          ?.map((g) => g?.id?._id);
        const messageQuery = {
          groupId,
          sender,
          receivers,
          messageData: validMessageData,
        };
        if (group.caseId) {
          messageQuery.caseId = group.caseId;
        }
        const createdMessage = await Message.create(messageQuery);
        if (createdMessage) {
          const { token: accessToken } = await oAuth2Client.getAccessToken();
          await axios({
            method: "post",
            url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${response?.data?.messages[0]?.id}/modify`,
            headers: {
              Authorization: `Bearer ${accessToken} `,
              // "Content-type": "application/json"
            },
            data: {
              addLabelIds: ["Label_2117604939096943395"],
              removeLabelIds: ["UNREAD"],
            },
          });
          return res.json({ success: true, createdMessage });
        } else {
          return res.json({
            msg: "Failed to forward mail",
            groupId,
            data: response.data,
          });
        }
      } else {
        return res.json({
          msg: "No group found ",
          groupId,
          data: response.data,
        });
      }
    } else {
      console.log("NO messages Found", response.data);
      return res.json({ data: response.data });
    }
  } catch (error) {
    console.log(error);
    // console.log(error?.name);
    // console.log(error?.response?.data);
    // console.log(error?.response?.status);
    // console.log(error?.response?.headers);
    return res.send(error);
  }
}

async function readMail(req, res) {
  try {
    const url = `https://gmail.googleapis.com//gmail/v1/users/me/messages/${req.params.messageId}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    let data = await response.data;
    res.json(data);
  } catch (error) {
    res.send(error);
  }
}

module.exports.mailReplyController = {
  getUser,
  getDrafts,
  searchMail,
  readMail,
};
