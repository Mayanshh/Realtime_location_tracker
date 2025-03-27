
const socket = io();
let map;
const markers = {};
let userMarker;
let firstLocationReceived = false;

function initMap() {
  map = L.map('map', {
    zoomControl: true,
    doubleClickZoom: true,
    boxZoom: true,
    dragging: true,
    touchZoom: true
  }).setView([0, 0], 2);

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

  function handlePosition(position) {
    const { latitude: lat, longitude: lon } = position.coords;
    socket.emit('location', { lat, lon });
    
    if (!userMarker) {
      userMarker = L.marker([lat, lon], {
        title: 'You',
        zIndexOffset: 1000
      }).addTo(map);
    } else {
      userMarker.setLatLng([lat, lon]);
    }

    if (!firstLocationReceived) {
      map.setView([lat, lon], 15);
      firstLocationReceived = true;
    }
  }

  function handleError(error) {
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
  }

  // Get initial position
  navigator.geolocation.getCurrentPosition(handlePosition, handleError, options);
  
  // Then watch for changes
  navigator.geolocation.watchPosition(handlePosition, handleError, options);
}

// Initialize map and start tracking
initMap();
startLocationTracking();

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    map.invalidateSize();
    if (userMarker) {
      map.setView(userMarker.getLatLng(), map.getZoom());
    }
  }
});

// Socket event handlers
socket.on('recieve-location', (data) => {
  const { id, lat, lon } = data;
  
  // Don't create marker for own position
  if (id === socket.id) return;
  
  if (!markers[id]) {
    markers[id] = L.marker([lat, lon], {
      title: `User ${id.substr(0, 4)}`
    }).addTo(map);
  } else {
    markers[id].setLatLng([lat, lon]);
  }
});

socket.on('user-disconnect', (id) => {
  if (markers[id]) {
    markers[id].remove();
    delete markers[id];
  }
});
