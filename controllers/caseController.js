const config = require("../config");
const Case = require("../models/Case");
const Group = require("../models/Group");
const userModel = require("../models/userModel");

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
    const { userId, page = 1, limit = 50, searchText = "" } = req.body;
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
        // admins: [admin],
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

const ADD_ADMIN = async (req, res) => {
  try {
    const { admin, caseId } = req.body;
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        $push: { admins: admin },
      },
      { new: true }
    );
    if (updatedCase) {
      return res.json({ success: true, updatedCase });
    }
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};
const REMOVE_ADMIN = async (req, res) => {
  try {
    const { admin, caseId } = req.body;
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        $pull: { admins: admin },
      },
      { new: true }
    );
    if (updatedCase) {
      return res.json({ success: true, updatedCase });
    }
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

const LEAVE_CASE = async (req, res) => {
  try {
    const { caseId, memberId } = req.body;

    // Find all the groups related to the caseId
    const groups = await Group.find({ caseId });

    // Remove the member from all the related groups
    const updates = groups.map((group) => {
      return Group.findByIdAndUpdate(
        group._id,
        {
          $pull: { groupMembers: { id: memberId } },
        },
        { new: true }
      );
    });
    const updatedGroups = await Promise.all(updates);

    // Update the case to remove the member
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        $pull: {
          caseMembers: { id: memberId },
          notifyMembers: memberId,
        },
      },
      { new: true }
    );

    if (updatedCase && updatedGroups) {
      return res.json({ success: true, updatedCase, updatedGroups });
    }
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};
const COMPLETED_CASE = async (req, res) => {
  try {
    const { caseId } = req.body;
    const completedCases = await Case.findByIdAndUpdate(caseId, {
  
      isCompleted: true
    }, { new: true });

    if (completedCases) {
      // Remove the completed case from the user's cases array
      const updatedCase = await Case.findByIdAndUpdate(caseId, {
        caseMembers: [],
        notifyMembers: []
      }, { new: true });

      return res.json({ success: true, completedCases:updatedCase });
    } else {
      return res.json({ success: false, message: "Failed to complete case" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
const GETCOMPLETEDCASES = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const allcompletedCases = await Case.find({
      admins: userId,
      isCompleted: true
    });
    if(allcompletedCases){
    return res.json({ success: true, allcompletedCases });
  }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}


module.exports.caseController = {
  LEAVE_CASE,
  CREATE,
  GETBYUSERID,
  COMPLETED_CASE,
  UPDATE_CASE,
  ADD_ADMIN,
  GETCOMPLETEDCASES,
  REMOVE_ADMIN,
};
