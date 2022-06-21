const { json } = require("express");
const express = require("express");
const PrivateChatModel = require("../models/PrivateChatModel");
const router = express.Router();

router.post("/allPrivateMessages", async (req, res) => {
  const { sender, receiver } = req.body;
  PrivateChatModel.find(
    {
      $or: [
        { sender, receiver },
        {
          sender: receiver,
          receiver: sender,
        },
      ],
    },
    null,
    { sort: { createdAt: 1 } },
    (err, messages) => {
      if (err) {
        return res.json({ "messages error": err });
      }
      if (messages) {
        return res.json({ messages });
      }
    }
  );
});

module.exports = router;
