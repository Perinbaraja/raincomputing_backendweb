const jwt = require("jsonwebtoken");
const config = require("../config");

const JWTtokenGenerator = async (user) => {
  const token = jwt.sign(user, config.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};
module.exports.JWTtokenGenerator = JWTtokenGenerator;
