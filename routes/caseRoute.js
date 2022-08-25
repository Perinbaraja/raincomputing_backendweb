const { Router } = require("express");
const { caseController } = require("../controllers/CaseController");
const router = Router();
router.get("", (req, res) => res.send("Case Route"));
router.post("/create", caseController.CREATE);
router.post("/getByUserId", caseController.GETBYUSERID);
router.post("/updateCase", caseController.UPDATE_CASE);

module.exports = router;