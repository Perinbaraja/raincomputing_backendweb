const mongoose = require("mongoose");

const caseSchema = mongoose.Schema(
  {
    caseName: {
      type: String,
      required: true,
    },
    caseId: {
      type: String,
      required: true,
    },
    caseMembers: [
      {
        _id: false,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        addedAt: {
          type: Date,
          default: Date.now(),
        },
        lastModifiedAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    notifyMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    aflag: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
