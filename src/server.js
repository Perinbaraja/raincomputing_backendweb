const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const create = async () => {
  const app = express();
  //DB connection
  mongoose
    .connect(
      "mongodb+srv://perinbaraja:9003611910Raja@syntorion.6iyih.mongodb.net/Rain",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

  //Allowing cors
  app.use(cors());
  //Body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 500000,
    })
  );

  //Middleware configuration

  // app.get("/", (req, res) => res.send("Hello"));

  app.use("/api/user", require("./routes/userRoute"));
  //   app.use("/api/property", require("./routes/propertyRoute"));
  return app;
};

module.exports = {
  create,
};
