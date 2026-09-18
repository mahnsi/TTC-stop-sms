// L is a Leaflet object
//create map object that points to Toronto coordinates at zoom level 12, attatch it to mapview div
const map = L.map('map', { 
    center: [43.6532, -79.3832],
    zoom: 12 
});

// Tiles to display actual map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
  subdomains: 'abc'
}).addTo(map);

// clusters to enable grouping into circles behaviour for readability
const clusters = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: '<div>' + count + '</div>',
        className: 'marker-cluster marker-cluster-ttc',
        iconSize: L.point(40, 40)
      });
    }
  });
   
  const statusEl = document.getElementById('status');
  const searchInput = document.getElementById('search-input');
  const resultsEl = document.getElementById('results');
   
  let allFeatures = [];
  let markerByCode = new Map();
   
  fetch('./ttc_stops.geojson')
    .then(res => {
      if (!res.ok) throw new Error('not found');
      return res.json();
    })
    .then(data => {
      allFeatures = data.features || [];
   
      allFeatures.forEach(f => {
        const [lon, lat] = f.geometry.coordinates;
        const code = f.properties.stop_code ?? '';
        const name = f.properties.stop_name ?? '';
   
        const marker = L.circleMarker([lat, lon], {
          radius: 6,
          weight: 2,
          color: '#DA291C',
          fillColor: '#ffffff',
          fillOpacity: 1
        });
   
        marker.bindTooltip(String(code), {
          permanent: true,
          direction: 'top',
          offset: [0, -4],
          className: 'stop-code-label'
        });
   
        marker.bindPopup('<b>Stop ' + code + '</b><br>' + name);
   
        clusters.addLayer(marker);
        if (code !== '') markerByCode.set(String(code), marker);
      });
   
      map.addLayer(clusters);
      statusEl.textContent = allFeatures.length.toLocaleString() + ' stops loaded';
      setTimeout(() => statusEl.classList.add('hidden'), 2500);
    })
    .catch(() => {
      statusEl.textContent = "Couldn't find ttc_stops.geojson — put it in the same folder as this file.";
    });
   
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    resultsEl.innerHTML = '';
    if (!q) return;
   
    const matches = [];
    for (const [code, marker] of markerByCode) {
      if (code.startsWith(q)) {
        matches.push({ code, marker });
        if (matches.length >= 8) break;
      }
    }
   
    matches.forEach(({ code, marker }) => {
      const item = document.createElement('div');
      item.className = 'result-item';
      const name = marker.getPopup().getContent().split('<br>')[1] || '';
      item.innerHTML = '<span class="result-code">' + code + '</span>' + name;
      item.addEventListener('click', () => {
        map.setView(marker.getLatLng(), 18);
        marker.openPopup();
        resultsEl.innerHTML = '';
        searchInput.value = code;
        searchInput.blur();
      });
      resultsEl.appendChild(item);
    });
  });
   
  