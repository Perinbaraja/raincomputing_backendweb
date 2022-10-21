// const express = require("express");
// const Subgroup = require("../models/SubgroupModel");
// const router = express.Router();

// router.get("/", (req, res) => res.send("SubGroup Route"));

// router.post("/create", async (req, res) => {
//   try {
//     const { name, parentRoom, members } = req.body;
//     const createdSubgroup = await Subgroup.create({
//       name,
//       parentRoom,
//       members,
//     });
//     if (createdSubgroup) res.json({ success: true, subGroup: createdSubgroup });
//   } catch (err) {
//     res.json({ msg: err || "Error Occured" });
//   }
// });

// router.post("/getByParentRoom", async (req, res) => {
//   try {
//     const { parentRoomId } = req.body;
//     const subGroups = await Subgroup.find({
//       parentRoom: parentRoomId,
//       aflag: true,
//     });
//     if (subGroups) res.json({ success: true, subGroups });
//   } catch (err) {
//     res.json({ msg: err || "Error Occured" });
//   }
// });

// module.exports = router;
