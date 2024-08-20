const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
//importing socket.io
const socketio = require("socket.io");
//works on http so establishing a server
const server = http.createServer(app);
//socket.io is a middleware so we need to use it with express
const io = socketio(server);

app.set("view engine", "ejs");
// app.set(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

//handling reequest from frontend
io.on("connection", function (socket) {
  //accept the send-location event in backend
  socket.on("send-location", function (data, username) {
    //emit the location to all connected clients send the req to frontend
    io.emit("recieve-location", { id: socket.id, ...data, username });
  });
  //handle disconnection feature
  socket.on("disconnect", function () {
    // console.log("a user disconnected");
    io.emit("user-disconnected", socket.id);
  });

  console.log("new connection");
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3000);
