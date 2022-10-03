const { Router } = require("express");
const { messageController } = require("../controllers/messageController");
const router = Router();

router.get("", (req, res) => res.send("Message route"));

router.post("/send", messageController.SENDMESSAGE);
router.post("/reply", messageController.REPLYMESSAGE);
router.post("/get", messageController.GETMESSAGES);
router.post("/getFiles", messageController.GETFILES);
router.post("/getmsgById", messageController.GETMESSAGEBYID);
router.post("/deletemsg", messageController.DELETEMSG);
router.post("/mailChat", messageController.MAIL_CHAT);
router.post("/getsendernameById", messageController.GETSENDERBYNAMEID);

module.exports = router;
