
const socket = io();
let map;
const markers = {};

function initMap() {
  map = L.map('map', {
    zoomControl: true,
    doubleClickZoom: true,
    boxZoom: true,
    dragging: true,
    touchZoom: true
  }).setView([0, 0], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© Mayansh Bangali'
  }).addTo(map);
}


function startLocationTracking() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude: lat, longitude: lon } = position.coords;
      socket.emit('location', { lat, lon });
    },
    (error) => {
      let errorMessage;
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
        default:
          errorMessage = "An unknown error occurred";
      }
      console.error(`Geolocation error: ${errorMessage}`);
    },
    options
  );
}


initMap();
startLocationTracking();


socket.on('recieve-location', (data) => {
  const { id, lat, lon } = data;
  if (!markers[id]) {
    markers[id] = L.marker([lat, lon]).addTo(map);
  } else {
    markers[id].setLatLng([lat, lon]);
  }
  map.setView([lat, lon]);
});

socket.on('user-disconnect', (id) => {
  if (markers[id]) {
    markers[id].remove();
    delete markers[id];
  }
});


document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    map.invalidateSize();
  }
});
