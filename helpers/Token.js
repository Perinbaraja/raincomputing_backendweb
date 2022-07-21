const jwt = require("jsonwebtoken");
const config = require("../config");

const JWTtokenGenerator = async (props) => {
  const {id,expire="30d"} = props
  const token = jwt.sign({id}, config.JWT_SECRET, {
    expiresIn:expire,
  });
  return token;
};
module.exports.JWTtokenGenerator = JWTtokenGenerator;
