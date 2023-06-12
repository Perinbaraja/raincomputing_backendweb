const mongoose = require("mongoose");

const intervalSchema = mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
  },

  interval: {
    type: Number,
  },
  events: [
    {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventModel",
      },
      intervals: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: mongoose.Types.ObjectId,
          },
          responseText: { type: String },
          responseDate: { type: Date },
        },
      ],
      receivedDate: {
        type: Date,
      },
      createdAt: { type: Date, default: new Date() },
      aflag: {
        type: Boolean,
        default: true,
      },
    },
  ],
});
module.exports = mongoose.model("Interval", intervalSchema);
