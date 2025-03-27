const socket = io();
if (navigator.geolocation) { navigator.geolocation.watchPosition(function(position){
     let lat = position.coords.latitude;
     let lon = position.coords.longitude;

     socket.emit('location', {lat,lon});
   }, (error) => {
     
     console.log(`An error occurred: ${error}`);
     
   },{
     enableHighAccuracy: true,
     timeout: 5000,
     maximumAge: 0
   });
}
else {
   console.log('Geolocation is not supported by this browser.');
}

const markers = {};

const map = L.map('map').setView([0,0], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

socket.on('recieve-location', (data) => {
    const { id, lat, lon } = data;
    map.setView([lat, lon]);

   if (markers[id]){
     markers[id].setLatLng([lat, lon]);
   } else {
     markers[id] = L.marker([lat,lon]).addTo(map);
   }
});

socket.on('user-disconnect', (id) => {
  if (markers[id]){
    markers[id].remove();
    delete markers[id];
  }
})