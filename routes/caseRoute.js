const { Router } = require("express");
const { caseController } = require("../controllers/caseController");
const router = Router();
router.get("", (req, res) => res.send("Case Route"));
router.post("/create", caseController.CREATE);
router.post("/getByUserId", caseController.GETBYUSERID);
router.post("/updateCase", caseController.UPDATE_CASE);
router.post("/addAdmin", caseController.ADD_ADMIN);
router.post("/removeAdmin", caseController.REMOVE_ADMIN);
router.post("/leaveGroup", caseController.LEAVE_CASE);
router.post("/completedGroup", caseController.COMPLETED_CASE);
router.post("/allcompletedGroup", caseController.GETCOMPLETEDCASES);

module.exports = router;
