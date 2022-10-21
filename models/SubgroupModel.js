// const mongoose = require("mongoose");

// const subgroupSchema = mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     parentRoom: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ChatRooms",
//     },
//     members: [
//       {
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "UserModel",
//         },
//         isActive: {
//           type: Boolean,
//           default: true,
//         },
//         addedBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "UserModel",
//         },
//         addedAt: {
//           type: Date,
//           default: Date.now(),
//         },
//         lastModifiedAt: {
//           type: Date,
//           default: Date.now(),
//         },
//       },
//     ],
//     aflag: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("subGroup", subgroupSchema);
