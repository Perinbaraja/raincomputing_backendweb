const config = {
  MONGO_URL:
    "mongodb://raincomputingcosmosdb:tBYDpH68hIKiWL1dd72FlUV7m8tn3rqy6OV0fVWDSuzvSJ8XtovbzRP6bG4xMPKIwfTCHHr2AIveACDbx3ff6w%3D%3D@raincomputingcosmosdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@raincomputingcosmosdb@",
  JWT_SECRET: "dev",
  PORT: 8080,
  MAIL_SERVICE: "gmail",
  SENDER_MAIL: "rpmongotest@gmail.com",
  MAIL_PASSWORD: "hspbrzryscrtuqqf",
  RESET_PASSWORD: "dev123",
  FE_URL: "https://raincomputing.net",
  DEFAULT_RES_ERROR: "Something wrong occured",
  MAIL_CLIENT_ID:
    "729499635503-cdvdr8eba2h50m0qv5skfpclvoa1jbuk.apps.googleusercontent.com",
  MAIL_CLIENT_SECRET: "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",
  MAIL_REFRESH_TOKEN:
    "1//04BJ8eGW1NyUNCgYIARAAGAQSNwF-L9Ir6qlYf08ml2J_DwiCgISSRobJJzpM4edRjmEHreG3VpqpbeBIkj-7tsRtr8mj49N6WBQ",
  MAIL_REDIRECT_URI: "http://localhost:8080/api/mail/searchMail",
};

module.exports = config;
