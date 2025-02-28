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


let btnTrees = document.getElementById('btnTrees');

btnTrees.addEventListener('click', async () => {
    try {
        // Fetch GeoJSON data
        const response = await fetch('arboles.geojson'); // Ensure file is accessible
        const data = await response.json();

        // Add GeoJSON layer
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: 5,
                    fillColor: 'green',
                    color: 'green',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        }).addTo(map);

    } catch (error) {
        console.error('Error loading GeoJSON:', error);
    }
});


let btnDistance = document.getElementById('btnDistance');

// Ensure you have jsPDF included in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

btnDistance.addEventListener("click", async () => {
    try {
        // Fetch GeoJSON data
        const response = await fetch("arboles.geojson");
        const data = await response.json();

        if (data.features.length < 2) {
            console.warn("At least two trees are needed to calculate distances.");
            return;
        }

        // Extract all tree coordinates
        let trees = data.features.map((feature, index) => ({
            id: index + 1,
            coordinates: feature.geometry.coordinates
        }));

        // Compute pairwise distances
        let distances = [];
        trees.forEach((treeA) => {
            trees.forEach((treeB) => {
                if (treeA.id !== treeB.id) { // Avoid self-distance
                    let distance = turf.distance(
                        turf.point(treeA.coordinates),
                        turf.point(treeB.coordinates),
                        { units: "kilometers" }
                    );
                    distances.push([
                        `Tree ${treeA.id}`,
                        `Tree ${treeB.id}`,
                        treeB.coordinates.join(", "),
                        distance.toFixed(3) + " km"
                    ]);
                }
            });
        });

        // Call function to generate PDF
        generatePDF(distances, trees.length);

    } catch (error) {
        console.error("Error loading GeoJSON:", error);
    }
});

/**
* Generates a PDF report with tree distance data.
* @param {Array} distances - Array of tree-to-tree distances.
* @param {Number} totalTrees - Total number of trees in the dataset.
*/
function generatePDF(distances, totalTrees) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ensure autoTable is available
    if (typeof doc.autoTable !== "function") {
        console.error("autoTable is not loaded properly.");
        return;
    }

    // Add Title
    doc.setFontSize(16);
    doc.text("Reporte de Distancias entre árboles", 10, 10);
    doc.setFontSize(12);
    doc.text(`Total de árboles: ${totalTrees}`, 10, 20);

    // Add Table
    doc.autoTable({
        head: [["Desde el árbol", "Hasta el árbol", "Coordenades", "Distancia (km)"]],
        body: distances,
        startY: 30
    });

    // Save PDF
    doc.save("tree_distances.pdf");
}