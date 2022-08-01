const express = require("express");
const _ = require("lodash");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");
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
const Message = require("./models/Message");

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

    socket.on("s_m", async (payload) => {
      try {
        const { receivers } = payload;
        const createdMessage = await Message.create(payload);
        if (createdMessage) {
          socket.emit("s_s", createdMessage);
          await receivers.map((receiver) => {
            if (!(receiver in users)) {
              console.log("Reciver is offline  : ", receiver);
              UserModel.findById(receiver, async (err, recivingUser) => {
                if (err) {
                  console.log("Error in getting user :", err);
                } else {
                  const mailOptions = {
                    to: recivingUser.email,
                    subject: "New message in chat",
                    html: `<div><h3> Hello ${recivingUser.firstname}  ${recivingUser.lastname},</h3><p>You have a New message</p>
                    <a href="http://raincomputing1.azurewebsites.net/rc-chat">View Message</a></div>`,
                  };
                  const mailResult = await sendMail(mailOptions);
                  console.log("Mail response", mailResult);
                }
              });
            } else {
              console.log("Reciver is online  : ", receiver);
              socket.broadcast.to(receiver).emit("r_m", createdMessage);
            }
          });
        }
      } catch (error) {
        console.log("error while emit msg :", error);
      }
    });

    socket.on(
      "send_message",
      async ({
        chatRoomId,
        sender,
        receivers,
        messageData,
        createdAt,
        isAttachment,
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
                              const mailOptions = {
                                to: recivingUser.email,
                                subject: "New message in chat",
                                html: `<div><h3> Hello ${recivingUser.firstname}  ${recivingUser.lastname},</h3><p>You have a New message</p>
                              <a href="http://raincomputing1.azurewebsites.net/rc-chat">View Message</a></div>`,
                              };
                              const mailResult = await sendMail(mailOptions);
                              console.log("Mail response", mailResult);
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

  //Attachment uploading
  let gfs;
  mongoose.connection.on("connected", () => {
    const db = mongoose.connections[0].db;
    gfs = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "attachments",
    });
  });
  //Declaring GridFS storage
  const storage = new GridFsStorage({
    url: config.MONGO_URL,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            console.log("Final Step err:", err);
            return reject(err);
          }
          const filename =
            buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "attachments",
          };
          console.log("Final Step fileInfo:", fileInfo);
          resolve(fileInfo);
        });
      });
    },
  });

  const store = multer({
    storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  });
  //Checking file types
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLocaleLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb("filetype");
  }
  //Attachment middleware
  const uploadMiddleware = (req, res, next) => {
    const upload = store.array("file");
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).send("file to large");
      } else if (err) {
        console.log("m error: ", err);
        if (err === "filetype") return res.status(400).send("file type error");
        return res.send("file upload error");
      }
      next();
    });
  };
  //atatchment upload
  app.post("/upload", uploadMiddleware, async (req, res) => {
    const { files } = req;
    return res.json({ success: true, files });
  });

  app.get("/file/:id", ({ params: { id } }, res) => {
    if (!id || id === "undefined") return res.status(400).send("no image id");
    const _id = new mongoose.Types.ObjectId(id);
    gfs.find({ _id }).toArray((err, files) => {
      if (!files || files.length === 0)
        return res.status(400).send("no files exist");
      // if a file exists, send the data
      gfs.openDownloadStream(_id).pipe(res);
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
  app.use("/api/case", require("./routes/caseRoute"));
  app.use("/api/group", require("./routes/groupRoute"));
  app.use("/api/message", require("./routes/messageRoute"));
  // return app;

  return server;
};

module.exports = {
  create,
};
