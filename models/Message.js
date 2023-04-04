const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    receivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],

    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        replyMsg: {
          type: String,
        },
        createdAt: { type: Date, default: new Date() },
        aflag:{
          type:Boolean,
          default:true
        }
      },
    ],

    messageData: {
      type: String,
    },
    pinMessage: [
      {
      type: String,
    }
  ],
    notes: [
      {
      attachmentid: {
        type: String,
      },
      note:{
      type: String,
      },
      createdAt: { type: Date, default: new Date() },
      aflag:{
        type:Boolean,
        default:true
      }
    }
  ],
  isPinned: {
    type: Boolean,
    default: false
  },
    isAttachment: {
      type: Boolean,
      default: false,
    },
    isVoiceMessage: {
      type: Boolean,
      default: false,
    },
    attachments: [],
    voiceMessage:[],
  
    isForward: {
      type: Boolean,
      default: false,
    },
    aflag: {
      type: Boolean,
      default: true,
    },
    cleardBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    bookmarkedBy: [
      {
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        note: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
