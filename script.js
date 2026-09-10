const map = L.map('map', { zoomControl: false }).setView([43.6532, -79.3832], 12);
L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
  subdomains: 'abc'
}).addTo(map);

