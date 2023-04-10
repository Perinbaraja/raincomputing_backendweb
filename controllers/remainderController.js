
const cron = require('node-cron');


cron.schedule('*/3 * * * * *', () => {
    // Insert the function here

    const nextNotifyData =  RemainderModel.find({
        isActive: true,
        nextScheduledTime: { $gt: now },
      })
        .populate({
          path: "messageId",
          select: "_id messageData",
        })
        .populate({
          path: "selectedMembers.id",
          select: "_id firstname lastname email",
        })
        .exec();

        console.log("nextNotifyData")
    nextNotifyData.forEach((reminder) => {
      // Rest of the function code
    });
  });












module.exports.remainderController = {
    getUser,
    getDrafts,
    searchMail,
    readMail,
  };
  