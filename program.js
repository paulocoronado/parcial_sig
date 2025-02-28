var map = L.map('map').setView([4.622341088343036, -74.17087418505113], 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var polígono_cargado = false;
async function cargarPolígono() {

    if (!polígono_cargado) {

        try {
            // Fetch GeoJSON data
            const response = await fetch('gran_britalia.geojson'); // Ensure file is accessible
            const data = await response.json();

            // Add GeoJSON layer
            L.geoJSON(data, {
                style: { color: 'blue', weight: 1 },
                onEachFeature: (feature, layer) => {
                    layer.bindPopup('Gran Britalia');
                }
            }).addTo(map);

            polígono_cargado = true;

        } catch (error) {
            console.error('Error loading GeoJSON:', error);
        }
    }
}

cargarPolígono();