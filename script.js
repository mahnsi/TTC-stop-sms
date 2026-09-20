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

// marker clusters to enable grouping behaviour
// initially an empty group to hold all the markers
const clusters = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 60, 
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: '<div>' + count + '</div>', //cluster labels the number of stops in the cluster
        className: 'marker-cluster marker-cluster-ttc',
        iconSize: L.point(40, 40)
      });
    }
  });
   
  const statusEl = document.getElementById('status');
  const searchInput = document.getElementById('search-input');
  const resultsEl = document.getElementById('results');
   
  let allFeatures = [];
  let allStops = [];

  fetch('./ttc_stops.geojson')
    .then(res => {
      if (!res.ok) throw new Error('not found');
      return res.json();
    })
    .then(data => {
      allFeatures = data.features || [];
   
      allFeatures.forEach(f => { //loop through each feature (each stop)
        const [lon, lat] = f.geometry.coordinates; 
        const code = f.properties.stop_code ?? ''; //get stop code and stop name from feature
        const name = f.properties.stop_name ?? ''; // with null safety 
   
        const marker = L.circleMarker([lat, lon]); //create layer of visual marker on the coordinates
   
        marker.bindTooltip(String(code), {
          permanent: true,
          direction: 'top',
          offset: [0, -4],
          className: 'stop-code-label'
        }); //text label on the marker to show code
   
        marker.bindPopup('<b>Stop ' + code + '</b><br>' + name); //show stop name as well on click of marker
   
        clusters.addLayer(marker); //add the marker to the marker cluster group
        allStops.push({ code: String(code), name: String(name), marker }); //add it to the allstops array (for search functionality)
      });
   
      map.addLayer(clusters); // add the whole marker cluster group onto the map
      statusEl.textContent = allFeatures.length.toLocaleString() + ' stops loaded';
      setTimeout(() => statusEl.classList.add('hidden'), 2500); //fade out status message
    })
    .catch(() => {
      statusEl.textContent = "Couldn't find ttc_stops.geojson — put it in the same folder as this file.";
    });
   
  searchInput.addEventListener('input', () => { //search box event listener
    const q = searchInput.value.trim();
    const qLower = q.toLowerCase();
    resultsEl.innerHTML = '';
    if (!q) return;
   
    const codeMatches = [];
    for (const stop of allStops) {
      if (stop.code.startsWith(q)) {
        codeMatches.push(stop);
        if (codeMatches.length >= 8) break;
      }
    }
   
    const nameMatches = [];
    if (codeMatches.length < 8) {
      for (const stop of allStops) {
        if (!stop.code.startsWith(q) && stop.name.toLowerCase().includes(qLower)) {
          nameMatches.push(stop);
          if (codeMatches.length + nameMatches.length >= 8) break;
        }
      }
    }
  
    const matches = codeMatches.concat(nameMatches);
    matches.forEach(({ code, name, marker }) => {
      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = '<span class="result-code">' + code + '</span>' + name;
      item.addEventListener('click', () => { //event listener for search result click
        map.setView(marker.getLatLng(), 18); // zoom in to that location on the map
        marker.openPopup();
        resultsEl.innerHTML = '';
        searchInput.value = code;
        searchInput.blur();
      });
      resultsEl.appendChild(item);
    });
  });  
   
  