const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);
const {
  messageGenerator,
  locationMessageGenerator,
} = require("./utils/messages.js");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

io.on("connection", (socket) => {
  console.log("New User connected");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    socket.emit("message", messageGenerator("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        messageGenerator("Admin", `${user.username} has joined !`)
      );
    callback();
  });

  socket.on("sendMessage", (clientMessage, callback) => {
    const user = getUser(socket.id);
    // if(!user){
    //   return callback("user doesn't exist")
    // }
    const filter = new Filter();
    if (filter.isProfane(clientMessage)) {
      return callback("Profane words aren't allowed");
    }
    io.to(user.room).emit(
      "message",
      messageGenerator(user.username, clientMessage)
    );
    callback();
  });

  socket.on("sendLocation", ({ lat, long }, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      locationMessageGenerator(
        user.username,
        `https://www.google.com/maps?q=${lat},${long}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    if (user) {
      io.to(user.room).emit(
        "message",
        messageGenerator("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  // socket.emit("countUpdated", count);
  // socket.on("increment", () => {
  //   count++;
  //   io.emit("countUpdated", count);
  // });
});

const publicDirectoryPath = path.join(__dirname, "../public");
app.get("/index.html", (req, res) => {
  res.send();
});
app.use(express.static(publicDirectoryPath));
server.listen(port, () => {
  console.log("Server is up at port " + port);
});
