const config = require("../config");
const Group = require("../models/Group");

const CREATE_GROUP = async (req, res) => {
  try {
    const { caseId, groupName, members, admin } = req.body;
    const isGroupExisting = await Group.findOne({ caseId, groupName });
    if (isGroupExisting) return res.json({ msg: "Group already existing" });
    const struturedMembers = members.map((m) => ({ id: m, addedBy: admin }));
    const groupQuery = {
      caseId,
      groupName,
      groupMembers: struturedMembers,
      isParent: false,
      isGroup: true,
      admins: [admin],
    };
    const createdGroup = await Group.create(groupQuery);
    if (createdGroup) return res.json({ success: true, group: createdGroup });
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

const GETBYCASEID_USERID = async (req, res) => {
  try {
    const { caseId, userId } = req.body;
    const groups = await Group.find(
      {
        caseId,
        aflag: true,
        groupMembers: {
          $elemMatch: {
            id: userId,
            isActive: true,
          },
        },
      },
      null,
      {
        sort: { isParent: -1, updatedAt: -1 },
      }
    );
    if (groups && groups.length > 0)
      return res.json({ success: true, groups: groups });
    else return res.json({ msg: "No groups Found" });
  } catch (err) {
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
};

module.exports.groupController = {
  CREATE_GROUP,
  GETBYCASEID_USERID,
};
