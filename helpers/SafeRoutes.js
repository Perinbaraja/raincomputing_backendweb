const ActiveSessionModel = require("../models/activeSession");

const isAuthenticated = (req, res, next) => {
  const { token } = req.headers;
  ActiveSessionModel.findOne(
    { token: token, aflag: true },
    function (err, session) {
      if (session) {
        return next();
      } else {
        return res.json({ msg: "User is not logged on" });
      }
    }
  );
};

module.exports = {
  isAuthenticated: isAuthenticated,
};
