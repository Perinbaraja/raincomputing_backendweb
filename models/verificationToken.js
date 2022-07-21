const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const verificationTokenSchema = mongoose.Schema({

  owner :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",  },


  token :{
    type : String,
    require : true
  },

createdAt :{
     type : Date,
     expires :3600,
     default: Date.now()
}
});

verificationTokenSchema.pre("save",async function (next){
  if(this.isModified("token")){
    const hash = await bcrypt.hash(this.token,10);
    this.token = hash;
  }
  next();
});
verificationTokenSchema.methods.compareToken = async function (token){
    const result = await bcrypt.compareSync(token,this.token);
    return result;
  };




module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
