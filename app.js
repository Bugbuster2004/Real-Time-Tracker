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

//geo fencing tech
const geofences = [
  {
    id: 1,
    name: "Office",
    latitude: 26.9124, // Example coordinates
    longitude: 75.7873,
    radius: 500, // in meters
  },
];

function isWithinGeofence(latitude, longitude, geofence) {
  const earthRadius = 6371e3; // Earth radius in meters
  const dLat = ((geofence.latitude - latitude) * Math.PI) / 180;
  const dLng = ((geofence.longitude - longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((geofence.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c; // Distance in meters

  return distance <= geofence.radius;
}

//handling reequest from frontend
io.on("connection", function (socket) {
  //accept the send-location event in backend
  socket.on("send-location", function (data, username) {
    const { latitude, longitude } = data;

    // Check each geofence to see if the user is within it
    geofences.forEach((geofence) => {
      const isInside = isWithinGeofence(latitude, longitude, geofence);

      // Check if the user has entered the geofence
      if (isInside) {
        socket.emit("geofence-alert", {
          message: `You have entered the ${geofence.name} area.`,
          geofenceId: geofence.id,
        });
      } else {
        socket.emit("geofence-alert", {
          message: `You have exited the ${geofence.name} area.`,
          geofenceId: geofence.id,
        });
      }
    });

    //emit the location to all connected clients send the req to frontend
    io.emit("recieve-location", { id: socket.id, ...data, username });
  });

  // Handle chat-message event
  socket.on("chat-message", function (data) {
    io.emit("chat-message", data); // Broadcast the message to all connected clients
  });

  // Handle typing event
  socket.on("typing", function (username) {
    socket.broadcast.emit("typing", username); // Broadcast typing status to others
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
