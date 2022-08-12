const config = require("../config");
const Case = require("../models/Case");
const Group = require("../models/Group");

const CREATE = async (req, res) => {
  try {
    const { caseId, caseName, members, admin } = req.body;
    const isCaseId = await Case.findOne({ caseId });
    if (isCaseId) return res.json({ msg: "Case Id Already existing" });
    const struturedMembers = members.map((m) => ({ id: m, addedBy: admin }));
    const caseQuery = {
      caseId,
      caseName,
      caseMembers: struturedMembers,
      notifyMembers: members,
      admins: [admin],
    };
    const createdCase = await Case.create(caseQuery);
    if (createdCase) {
      const groupQuery = {
        caseId: createdCase?._id,
        groupMembers: struturedMembers,
        isGroup: true,
        admins: [admin],
      };
      const createdGroup = await Group.create(groupQuery);
      if (createdGroup)
        return res.json({
          success: true,
          case: createdCase._id,
          group: createdGroup._id,
        });
    }
  } catch (err) {
    return res.json({
      msg: err || config.DEFAULT_RES_ERROR,
    });
  }
};

const GETBYUSERID = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10, searchText = "" } = req.body;
    const skip = (page - 1) * limit;
    const userCases = await Case.find(
      {
        $or: [
          { caseName: { $regex: "^" + searchText, $options: "i" } },
          { caseId: { $regex: "^" + searchText, $options: "i" } },
        ],
        caseMembers: {
          $elemMatch: {
            id: userId,
            isActive: true,
          },
        },
        aflag: true,
      },
      null,
      { limit: limit, skip: skip }
    ).populate([
      { path: "caseMembers.id", select: "firstname lastname profilePic email" },
      { path: "caseMembers.addedBy", select: "firstname lastname" },
    ]);

    if (userCases && userCases.length > 0)
      return res.json({ success: true, cases: userCases });
    else return res.json({ msg: "No cases Found" });
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

const UPDATE_CASE = async (req, res) => {
  try {
    const { id, caseId, caseName, members, admin, deleteIt } = req.body;
    if (deleteIt) {
      const deletedCase = await Case.findByIdAndUpdate(id, {
        aflag: false,
      });
      if (deletedCase)
        return res.json({ success: true, caseId: deletedCase?.caseId });
    } else {
      const struturedMembers = members.map((m) => ({ id: m, addedBy: admin }));
      const updateQuery = {
        caseName,
        caseId,
        caseMembers: struturedMembers,
        notifyMembers: members,
        admins: [admin],
      };
      const updatedCase = await Case.findByIdAndUpdate(id, updateQuery);
      if (updatedCase) {
        const everyoneGroup = await Group.findOne({
          caseId: id,
          isParent: true,
        });
        if (everyoneGroup) {
          const updateQueryForGroup = {
            groupMembers: struturedMembers,
          };
          await Group.findByIdAndUpdate(
            everyoneGroup?._id,
            updateQueryForGroup
          );
        }
        return res.json({ success: true, caseId });
      }
    }
  } catch (err) {
    console.log("Case update error", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

module.exports.caseController = {
  CREATE,
  GETBYUSERID,
  UPDATE_CASE,
};
