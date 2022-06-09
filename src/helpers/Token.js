const jwt = require("jsonwebtoken");

const JWTtokenGenerator = async (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};
module.exports.JWTtokenGenerator = JWTtokenGenerator;
