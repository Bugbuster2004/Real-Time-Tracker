// --------------- this file is for frontend js--------------------

//this sends a connection request to the backend app.js
const socket = io();
const username = prompt("Enter your username");

console.log("hey");

//check if the browser supports the geolocation
if (navigator.geolocation) {
  //request the current location
  navigator.geolocation.watchPosition(
    (position) => {
      //find the latitude and longitude now
      const { latitude, longitude } = position.coords;
      //send the location to the backend
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log(error);
    },
    //some additional seeting related to accuracy timeout
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

//now rendering location from leaflet map basically asking google for accessing the location
const map = L.map("map").setView([0, 0], 5);

// now to see the actual map we need to write this comman with url learn this
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

//adding the markers now hat pin type location
const markers = {};

//recieving the location here from backend
//this part basically aligns your map according to the location you are currently using
socket.on("recieve-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    //add marker
    console.log("Adding marker");
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(username)
      .openPopup();
  }
});

//handle disconnceton feature
socket.on("user-disconnected", (id) => {
  //remove the marker from the map
  if (markers[id]) {
    console.log("inside if");
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
