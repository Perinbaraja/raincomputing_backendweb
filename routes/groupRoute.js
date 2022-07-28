const { Router } = require("express");
const { groupController } = require("../controllers/groupController");
const router = Router();

router.get("", (req, res) => res.send("Group Route"));

router.post("/createGroup", groupController.CREATE_GROUP);

router.post("/getByUserandCaseId", groupController.GETBYCASEID_USERID);

module.exports = router;
