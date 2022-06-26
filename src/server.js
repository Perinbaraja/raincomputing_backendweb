const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const PrivateChatModel = require("./models/PrivateChatModel");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const create = async () => {
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
  io.on("connection", (socket) => {
    const id = socket.handshake.query.id;
    console.log(`User Connected: ${id}`);
    socket.join(id);

    socket.on(
      "send_message",
      async ({ sender, receiver, message, createdAt }) => {
        PrivateChatModel.create(
          { sender, receiver, message, createdAt },
          (err, chat) => {
            if (err) {
              console.log("Chat Error :", err);
            }
            if (chat) {
              socket.broadcast.to(receiver).emit("receive_message", {
                sender,
                receiver,
                message,
                createdAt,
              });
            }
          }
        );
        // socket.broadcast
        //   .to(receiver)
        //   .emit("receive_message", { sender, receiver, message, createdAt });
      }
    );
    // socket.on("join_room", (data) => {
    //   socket.join(data);
    //   console.log(`user with id: ${socket.id} joined room: ${data}`);
    // });

    // socket.on("send_message", (data) => {
    //   socket.to(data.room).emit("recive_message", data);
    //   console.log(data);
    // });
    socket.on("close_manually", () => {
      socket.disconnect();
    });
    socket.on("disconnect", (reason) => {
      console.log("user disconnected", reason);
    });
  });

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

  //socket io//

  // app.use(cors());

  //Middleware configuration

  app.get("/", (req, res) => res.send("Hello"));

  app.use("/api/user", require("./routes/userRoute"));
  app.use("/api/chat", require("./routes/privateChatRoute"));
  app.use("/api/pchat", require("./routes/chatRoute"));
  // return app;

  return server;
};

module.exports = {
  create,
};
