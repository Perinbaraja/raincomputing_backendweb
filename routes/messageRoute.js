const { Router } = require("express");
const { messageController } = require("../controllers/messageController");
const router = Router();

router.get("", (req, res) => res.send("Message route"));

router.post("/send", messageController.SENDMESSAGE);
router.post("/get", messageController.GETMESSAGES);
router.post("/getFiles", messageController.GETFILES);

module.exports = router;