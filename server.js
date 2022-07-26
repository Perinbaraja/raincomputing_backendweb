const express = require("express");
const _ = require("lodash");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const Chat = require("./models/ChatModel");
const config = require("./config");
const ChatRooms = require("./models/ChatRoomModel");
const UserModel = require("./models/userModel");
const { sendMail } = require("./services/mail.services");
const Attachments = require("./models/AttachmentModel");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const create = async () => {
  //Allowing cors
  app.use(
    cors({
      origin: true,
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );
  //Body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 500000,
    })
  );
  app.use(cookieParser());

  //DB connection
  mongoose
    .connect(config.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

  //Users object to save online users
  let users = {};

  //Socket methods
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.id;
    console.log(`User Connected: ${userId}`);
    socket.join(userId);

    // CHECK IS USER EXHIST
    if (!users[userId]) users[userId] = [];

    // PUSH SOCKET ID FOR PARTICULAR USER ID
    users[userId].push(socket.id);

    // USER IS ONLINE BROAD CAST TO ALL CONNECTED USERS
    io.sockets.emit("online", users);

    socket.on(
      "send_message",
      async ({
        chatRoomId,
        sender,
        receivers,
        messageData,
        createdAt,
        isAttachment = false,
        attachments,
      }) => {
        let attachmentsObjId = [];

        const handleMessageandAttachment = () => {
          const messageQuery = {
            chatRoomId,
            message: {
              sender,
              receivers,
              messageData,
            },
            attachments: attachmentsObjId,
            isAttachment,
            createdAt,
          };

          Chat.create(messageQuery, async (err, chat) => {
            if (err) {
              console.log("Chat Error :", err);
            }
            if (chat) {
              ChatRooms.findByIdAndUpdate(
                chatRoomId,
                { lastModified: Date.now() },
                async (err, modified) => {
                  if (err) {
                    console.log("modification Error :", err);
                  } else {
                    await receivers.map((receiver) => {
                      if (!(receiver in users)) {
                        console.log("Reciver is offline  : ", receiver);
                        UserModel.findById(
                          receiver,
                          async (err, recivingUser) => {
                            if (err) {
                              console.log("Error in getting user :", err);
                            } else {
                              //                   const mailOptions = {
                              //                     to: recivingUser.email,
                              //                     subject: "New message in chat",
                              //                     html: `<div><h3> Hello ${recivingUser.firstname}  ${recivingUser.lastname},</h3><p>You have a New message</p>
                              // <a href="http://raincomputing1.azurewebsites.net/rc-chat">View Message</a></div>`,
                              //                   };
                              // const mailResult = await sendMail(mailOptions);
                              // console.log("Mail response", mailResult);
                            }
                          }
                        );
                      } else {
                        console.log("Reciver is online  : ", receiver);

                        socket.broadcast.to(receiver).emit("receive_message", {
                          chatRoomId,
                          message: {
                            sender,
                            receivers,
                            messageData,
                          },
                          createdAt,
                          isAttachment,
                          attachments,
                        });
                      }
                    });
                  }
                }
              );
            }
          });
        };

        if (isAttachment) {
          Attachments.create(attachments, async (err, atts) => {
            if (err) {
              console.log("attachments Error :", err);
            } else {
              attachmentsObjId = await atts.map((i) => i._id);
              handleMessageandAttachment();
            }
          });
        } else {
          handleMessageandAttachment();
        }
      }
    );

    socket.on("close_manually", () => {
      socket.disconnect();
    });
    socket.on("disconnect", (reason) => {
      // REMOVE FROM SOCKET USERS
      _.remove(users[userId], (u) => u === socket.id);
      if (users[userId].length === 0) {
        // REMOVE OBJECT
        delete users[userId];
        // ISER IS OFFLINE BROAD CAST TO ALL CONNECTED USERS
        io.sockets.emit("online", users);
      }

      socket.disconnect(); // DISCONNECT SOCKET
      console.log("user disconnected", reason);
    });
  });

  //Middleware configuration

  app.get("/", (req, res) => res.send("Hello"));

  app.use("/api/user", require("./routes/userRoute"));
  app.use("/api/chat", require("./routes/privateChatRoute"));
  app.use("/api/pchat", require("./routes/chatRoute"));
  app.use("/api/attorney", require("./routes/attorneyRoute"));
  app.use("/api/firm", require("./routes/firmRoute"));
  app.use("/api/subgroup", require("./routes/subgroupRoute"));
  // return app;

  return server;
};

module.exports = {
  create,
};
